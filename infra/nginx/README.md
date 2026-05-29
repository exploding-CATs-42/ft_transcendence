# Nginx WAF

This nginx service runs as the public reverse proxy for the project and uses
OWASP ModSecurity Core Rule Set as a WAF layer before traffic reaches the
frontend, backend API, or Socket.IO endpoints.

## Protected Routes

The WAF remains enabled for application-facing routes:

- `/api`
- `/socket.io`

These routes are proxied to the backend service and inspected by ModSecurity
before the backend receives the request.

## Development Exclusions

Vite development-only routes are excluded from ModSecurity inspection:

- `/@vite/`
- `/@fs/`
- `/@react-refresh`
- `/node_modules/`
- `/src/`

These paths are used by the Vite dev server to load source files and hot reload
assets. OWASP CRS can treat paths such as `/@fs/.../node_modules/...` as
restricted file access attempts, so these exclusions prevent false positives in
local development.

The API and Socket.IO routes remain protected.

## Hardening

The WAF is configured through Docker Compose with:

- blocking mode enabled
- OWASP CRS paranoia level 2
- inbound and outbound anomaly thresholds

The nginx layer also applies:

- security response headers
- request body size limits
- request header/body timeouts
- keep-alive and send timeouts
- per-IP API rate limiting
- per-IP connection limiting

## Verification

Check that normal traffic still works:

```bash
curl -I http://localhost:8080/
```

Expected result: `200 OK` and security headers such as:

```text
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

Check that an XSS-like request is blocked:

```bash
curl "http://localhost:8080/api/users?username=<script>alert(1)</script>"
```

Expected result:

```text
403 Forbidden
```

Check that oversized request bodies are rejected:

```bash
python3 - <<'PY' | curl -i -X POST http://localhost:8080/api/users/login \
  -H "Content-Type: application/json" \
  --data-binary @-
print("A" * (2 * 1024 * 1024))
PY
```

Expected result:

```text
413 Request Entity Too Large
```

Check nginx and ModSecurity logs:

```bash
make logs-nginx
```

Blocked requests should include ModSecurity messages such as anomaly score
evaluation or matched OWASP CRS rule IDs.