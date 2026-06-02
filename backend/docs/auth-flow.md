# Auth Flow

This document explains how authentication currently works in the project:
login, logout, access tokens, refresh tokens, automatic token refresh, and the
known frontend edge cases.

## Token Types

The project uses two tokens:

- `accessToken` - a short-lived JWT returned in the response body. The frontend
  sends it in the `Authorization` header for protected HTTP requests.
- `refreshToken` - a longer-lived JWT stored in an `httpOnly` cookie. Frontend
  JavaScript cannot read it directly. The backend uses it to issue a new
  `accessToken`.

The refresh token is also stored in the database as a hash in `user_sessions`.
The raw refresh token is never stored in the database.

## Environment Variables

Token lifetime is configured in `backend/.env`:

```env
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

For local testing, shorter values are useful:

```env
JWT_ACCESS_EXPIRES_IN=1m
JWT_REFRESH_EXPIRES_IN=2m
```

After changing these values, restart the backend/container. Otherwise the old
values remain active.

## Backend: Login

Login route:

```ts
usersRouter.post("/login", loginController);
```

The controller calls `loginUser`, sets the refresh cookie, and returns the
access token:

```ts
const result = await loginUser(parsed.data);

res.cookie(
  REFRESH_TOKEN_COOKIE_NAME,
  result.refreshToken,
  getRefreshTokenCookieOptions(),
);

return res.status(200).json({
  user: result.user,
  accessToken: result.accessToken,
});
```

`loginUser`:

1. Finds the user by email.
2. Verifies the password.
3. Creates a new session id.
4. Creates a refresh token containing `sub` and `sessionId`.
5. Hashes the refresh token and stores the hash in `user_sessions`.
6. Creates an access token.
7. Returns the public user, access token, and refresh token.

After login:

- the access token is available to frontend code;
- the refresh token is stored by the browser as a cookie.

## Backend: Refresh

Refresh route:

```ts
usersRouter.post("/refresh", refreshController);
```

The refresh token is read from cookies:

```ts
const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE_NAME];
```

If the cookie is missing, the backend returns:

```json
{ "message": "Refresh token required" }
```

`refreshSession`:

1. Verifies the refresh token JWT.
2. Reads `sub` and `sessionId` from the payload.
3. Finds the session in `user_sessions`.
4. Checks that the session belongs to the same user.
5. Hashes the incoming refresh token and compares it with the stored hash.
6. Checks that the session is not expired.
7. Creates a new refresh token for the same session.
8. Updates the stored refresh token hash and expiration date.
9. Creates and returns a new access token.

The controller then sets the new refresh token cookie:

```ts
res.cookie(
  REFRESH_TOKEN_COOKIE_NAME,
  result.refreshToken,
  getRefreshTokenCookieOptions(),
);
```

This means refresh tokens are rotated. After a successful refresh, the previous
refresh token is no longer valid.

## Backend: Logout

Logout route:

```ts
usersRouter.post("/logout", logoutController);
```

Logout also uses the refresh token cookie. If the cookie is valid, the backend
deletes the matching session from `user_sessions` and clears the cookie:

```ts
res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, {
  httpOnly: true,
  secure: process.env["NODE_ENV"] === "production",
  sameSite: "lax",
  path: "/api/users",
});
```

The browser receives a cookie with an expiration date in the past:

```http
Set-Cookie: refreshToken=; Expires=Thu, 01 Jan 1970 00:00:00 GMT
```

That is normal. It is how the server tells the browser to delete the cookie.

## Refresh Cookie Options

The refresh token cookie is configured as:

```ts
{
  httpOnly: true,
  secure: process.env["NODE_ENV"] === "production",
  sameSite: "lax",
  path: "/api/users",
  maxAge: REFRESH_TOKEN_COOKIE_MAX_AGE_MS,
}
```

Important details:

- `httpOnly` prevents frontend JavaScript from reading the refresh token.
- `secure` requires HTTPS in production.
- `sameSite: "lax"` is a basic CSRF protection setting.
- `path: "/api/users"` means the cookie is sent only to `/api/users/*`.

When testing through nginx, requests should go through `/api/users/...`.

## Backend: Protected HTTP Routes

Protected HTTP routes use `authMiddleware`:

```ts
const authorizationHeader = req.header("Authorization");

if (!authorizationHeader?.startsWith("Bearer ")) {
  return res.status(401).json({ message: "Invalid token" });
}

const token = authorizationHeader.slice("Bearer ".length).trim();
const payload = verifyAccessToken(token);

req.user = {
  id: payload.sub,
};
```

Protected controllers can then read:

```ts
req.user.id
```

Examples:

```ts
friendsRouter.use(authMiddleware);
```

```ts
meRouter.patch("/", authMiddleware, updateMeController);
```

```ts
export const gamesRouter = createAuthenticatedRouter();
```

`GET /api/games` is useful for manually testing expired access tokens because
it is protected.

## Frontend: Access Token Storage

The frontend stores auth state through `AuthProvider`:

```ts
const [storedAccessToken, saveAccessToken] =
  useLocalStorage<StoredAccessToken>(
    AUTH_STORAGE_KEY,
    null,
  );

const accessToken = getStoredAccessToken(storedAccessToken);
```

`AUTH_STORAGE_KEY` is:

```ts
export const AUTH_STORAGE_KEY = "keys";
```

This means the access token is stored in browser `localStorage`. This survives
page refreshes.

The current local storage shape is:

```json
{ "accessToken": "..." }
```

`AuthProvider` normalizes this stored value before exposing it to the rest of
the app. This keeps `accessToken` as either a JWT string or `null`.

Important distinction:

```txt
localStorage stores accessToken
cookies store refreshToken
```

`localStorage` does not know whether the stored access token is expired. It only
stores data until the app or user removes it.

`AuthProvider` also synchronizes auth state with axios:

```ts
useEffect(() => {
  if (accessToken) {
    setAxiosToken(accessToken);
    return;
  }

  clearAxiosToken();
}, [accessToken]);
```

This restores the axios `Authorization` header after a page refresh. Without
this sync, React could still consider the user logged in from `localStorage`,
while axios would have lost its in-memory default header.

## Frontend: Axios Setup

Axios is configured with credentials enabled:

```ts
export const api = axios.create({
  baseURL: VITE_API_BASE_URL,
  withCredentials: true,
});
```

`withCredentials: true` is required so the browser sends the refresh token
cookie to the backend.

The access token is attached to axios requests with:

```ts
export const setAxiosToken = (token: string) => {
  api.defaults.headers.common.Authorization = `Bearer ${token}`;
};
```

Logout removes it:

```ts
export const clearAxiosToken = () => {
  delete api.defaults.headers.common.Authorization;
};
```

Axios defaults are kept only in JavaScript memory. They are lost on page
refresh, so `AuthProvider` re-applies the stored access token to axios when the
app starts.

## Frontend: Automatic Access Token Refresh

Axios has a response interceptor:

```ts
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    const requestUrl = originalRequest?.url;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      requestUrl !== "/users/refresh" &&
      requestUrl !== "/users/logout" &&
      requestUrl !== "/users/login"
    ) {
      originalRequest._retry = true;

      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }

      const accessToken = await refreshPromise;

      setAxiosToken(accessToken);

      originalRequest.headers.Authorization = `Bearer ${accessToken}`;

      return api(originalRequest);
    }

    const message = getErrorMessage(error);

    return Promise.reject({
      ...error,
      message,
    });
  },
);
```

Flow:

```txt
protected request -> 401
/users/refresh -> 200
axios stores the new access token
axios retries the original request
```

`refreshPromise` prevents multiple simultaneous refresh calls when several
requests fail with `401` at the same time.

The interceptor intentionally skips:

- `/users/refresh`, to avoid refreshing the refresh request itself;
- `/users/logout`, because logout should not try to recover by refreshing;
- `/users/login`, because invalid login credentials should not trigger a token refresh.

## Frontend: Logout Handling

The profile logout handler clears frontend auth state even if the backend
logout request fails:

```ts
const logoutUser = async () => {
  try {
    await api.users.logout();
  } catch {
    // Logout is best-effort because the backend session may already be expired.
  } finally {
    clearAccessToken();
  }
};
```

This matters because if the refresh token cookie is already missing or expired,
the backend may return `401`. The frontend should still clear local auth state
so the user is not stuck in a visually logged-in state.

## Frontend: Page Refresh Behavior

After a page refresh, browser storage survives but JavaScript memory is reset:

```txt
localStorage still contains accessToken
axios default Authorization header is lost
```

`AuthProvider` fixes this by reading the stored token and calling
`setAxiosToken(accessToken)` when the app starts.

This fixes:

```txt
F5 -> axios loses Authorization header
```

It does not validate the backend session. If the refresh token cookie has
expired but `localStorage` still contains an old access token, the user may
still appear logged in until an authenticated request fails.

A future improvement could validate the session on app startup:

```txt
app starts
if localStorage has accessToken:
  call /users/refresh
  if 200: keep user logged in
  if 401: clear local auth state
```

## Manual Testing

Set short token lifetimes:

```env
JWT_ACCESS_EXPIRES_IN=1m
JWT_REFRESH_EXPIRES_IN=2m
```

Restart containers:

```bash
make re
```

Login through the UI and wait until the access token expires. Then run in the
browser console:

```js
const auth = JSON.parse(localStorage.getItem("keys"));
const oldAccessToken = auth?.accessToken ?? auth;

const expiredAccessResponse = await fetch("/api/games", {
  headers: {
    Authorization: `Bearer ${oldAccessToken}`,
  },
  credentials: "include",
});

console.log("expired access status:", expiredAccessResponse.status);
console.log(await expiredAccessResponse.text());
```

Expected after access token expiration:

```txt
expired access status: 401
{"message":"Invalid token"}
```

Then test refresh:

```js
const refreshResponse = await fetch("/api/users/refresh", {
  method: "POST",
  credentials: "include",
});

console.log("refresh status:", refreshResponse.status);

const refreshData = await refreshResponse.json();
console.log(refreshData);
```

Expected while the refresh cookie is still valid:

```txt
refresh status: 200
{ accessToken: "..." }
```

Use the new token:

```js
const gamesResponse = await fetch("/api/games", {
  headers: {
    Authorization: `Bearer ${refreshData.accessToken}`,
  },
  credentials: "include",
});

console.log("games status:", gamesResponse.status);
console.log(await gamesResponse.text());
```

Expected:

```txt
games status: 200
```

After the refresh cookie expires, `/api/users/refresh` should return `401`.
If the browser has already deleted the expired cookie, the message is:

```json
{ "message": "Refresh token required" }
```

## Socket.IO Note

Socket.IO does not use axios, so the axios interceptor does not refresh socket
tokens automatically.

The backend socket middleware expects the access token in the socket handshake:

```ts
const token = socket.handshake.auth["token"];
```

A future game connection flow should:

1. Get a fresh access token before creating the socket.
2. Pass it as `auth.token`.
3. On `connect_error` caused by an invalid token, refresh and reconnect.
4. After reconnect, rejoin the game room and restore game state.

An already connected socket usually keeps working after token expiration because
the token is checked at connection time. Reconnects and page refreshes need a
fresh token.
