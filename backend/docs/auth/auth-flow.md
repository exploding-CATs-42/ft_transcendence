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

## Backend: Register

Register route:

```ts
usersRouter.post("/register", registerController);
```

Registration creates only the user account. It does not create an authenticated
session, does not set the refresh token cookie, and does not return an access
token:

```ts
const result = await registerUser(parsed.data);

return res.status(201).json({
  user: result.user,
});
```

After registration, the frontend should call `api.auth.login()` if it wants to
authenticate the new user immediately.

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

Currently useful protected endpoints for manual refresh testing:

- `GET /api/games`, protected through `createAuthenticatedRouter()`;
- `GET /api/me/friends`, protected through `friendsRouter.use(authMiddleware)`;
- `PATCH /api/me`, protected directly with `authMiddleware`.

`GET /api/games` is the easiest one to use in browser console tests because it
does not need a request body.

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

`AuthProvider` also writes auth changes to request token storage:

```ts
const setAccessToken = useCallback(
  (accessToken: AccessToken) => {
    saveAccessTokenForRequests(accessToken);
    saveAccessToken({ accessToken });
  },
  [saveAccessToken],
);

const clearAccessToken = useCallback(() => {
  clearAccessTokenForRequests();
  saveAccessToken(null);
}, [saveAccessToken]);
```

This keeps React auth state and the storage used by axios in sync.

`AuthProvider` also registers a callback for refreshed access tokens:

```ts
useEffect(() => {
  setAccessTokenRefreshHandler((accessToken) => {
    saveAccessToken({ accessToken });
  });

  return () => {
    setAccessTokenRefreshHandler(null);
  };
}, [saveAccessToken]);
```

This lets the axios interceptor update frontend auth storage after a successful
refresh without importing React hooks into `axios.ts`.

## Frontend: Axios Setup

The frontend auth API is exposed as `api.auth`, but the backend route names are
still `/users/...`:

```ts
api.auth.register(); // POST /users/register
api.auth.login();   // POST /users/login
api.auth.logout();  // POST /users/logout
api.auth.refresh(); // POST /users/refresh
```

`axios.ts` keeps a callback for refreshed access tokens at module level:

```ts
let onAccessTokenRefresh: ((accessToken: string) => void) | null = null;
```

Axios is configured with credentials enabled:

```ts
export const api = axios.create({
  baseURL: VITE_API_BASE_URL,
  withCredentials: true,
});
```

`withCredentials: true` is required so the browser sends the refresh token
cookie to the backend.

Access token persistence for requests lives in `authTokenStorage.ts`:

```ts
getStoredAccessToken();
saveStoredAccessToken(accessToken);
clearStoredAccessToken();
```

This module reads and writes the same local storage key used by `AuthProvider`.
It exists because `axios.ts` is not a React component and cannot use React hooks.

The access token is attached to axios requests by a request interceptor:

```ts
api.interceptors.request.use((config) => {
  const accessToken = getStoredAccessToken();

  config.headers = AxiosHeaders.from(config.headers);

  if (accessToken) {
    config.headers.set("Authorization", `Bearer ${accessToken}`);
  } else {
    config.headers.delete("Authorization");
  }

  return config;
});
```

This means axios reads the current access token for every request. After a page
refresh, axios does not need an in-memory default header to be restored; it reads
the persisted token before sending the request.

Logout clears request token storage:

```ts
export const clearAccessTokenForRequests = () => {
  authVersion += 1;
  clearStoredAccessToken();
};
```

`authVersion` is incremented whenever request auth is cleared. This lets pending
refresh work detect that the user logged out before the refresh completed.

The refresh callback is registered from `AuthProvider`:

```ts
export const setAccessTokenRefreshHandler = (
  handler: ((accessToken: string) => void) | null,
) => {
  onAccessTokenRefresh = handler;
};
```

When refresh succeeds, axios saves the new access token to request storage and
notifies `AuthProvider` to save the same token in React auth state.

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

      const refreshAuthVersion = authVersion;

      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }

      const accessToken = await refreshPromise;

      if (refreshAuthVersion !== authVersion) {
        return Promise.reject(error);
      }

      saveStoredAccessToken(accessToken);
      onAccessTokenRefresh?.(accessToken);

      originalRequest.headers = AxiosHeaders.from(originalRequest.headers);
      originalRequest.headers.set("Authorization", `Bearer ${accessToken}`);

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
axios stores the new access token in request storage
AuthProvider stores the new access token in localStorage
axios retries the original request
```

`refreshPromise` prevents multiple simultaneous refresh calls when several
requests fail with `401` at the same time.

`authVersion` prevents stale refresh results from being applied after logout.
A refresh request stores the current version before awaiting `/users/refresh`.
If logout clears axios auth while refresh is pending, the version changes, so
the returned access token is ignored and the original request is not retried.

This prevents this race:

```txt
protected request -> 401
/users/refresh starts
user logs out
request auth storage is cleared
/users/refresh returns a new accessToken
stale accessToken must not be written back to storage
```

The callback prevents a different stale-token problem:

```txt
protected request -> 401
/users/refresh returns a new accessToken
localStorage is updated with the same new accessToken
page refresh restores the fresh accessToken instead of the expired one
```

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
    await api.auth.logout();
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
axios module memory is reset
```

The request interceptor handles this by reading the stored token from
`authTokenStorage` before each request.

This fixes:

```txt
F5 -> axios can still attach Authorization from localStorage
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
