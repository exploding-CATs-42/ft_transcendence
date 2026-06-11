# Monitoring

Monitoring for the local `ft_transcendence` development environment.

Current status: this directory contains the monitoring specification only. There are no Prometheus configs, Grafana dashboards, exporters, or Docker Compose services in this directory yet.

## Target Setup

The monitoring stack is intended to use:

| Component | Purpose |
| --- | --- |
| Prometheus | Scrape and store application and infrastructure metrics |
| Grafana | Display dashboards and visualize alert states |
| Backend `/metrics` endpoint | Expose application metrics from the Express API |
| cAdvisor | Expose Docker container CPU, memory, and network metrics |
| postgres-exporter | Expose PostgreSQL metrics |

Prometheus should scrape services through the internal Docker network, not through public Nginx routes.

`Internal target` in this document means `service_name:container_port` inside the Docker network. It is not the same as a host port published with `ports`.

## Expected Services

The monitoring implementation should add these services to Docker Compose:

| Service | Internal target | Notes |
| --- | --- | --- |
| `prometheus` | `prometheus:9090` | Reads scrape config and alert rules |
| `grafana` | `grafana:3000` | Uses credentials from environment variables |
| `cadvisor` | `cadvisor:8080` | Reads Docker container metrics |
| `postgres-exporter` | `postgres-exporter:9187` | Connects to the existing PostgreSQL service |

Do not publish cAdvisor on host port `8080`. The project already uses `NGINX_PORT=8080`, which maps host `8080` to Nginx container port `80`.

If cAdvisor needs to be opened from the host, use another host port, for example:

```yaml
ports:
  - "8081:8080"
```

Prometheus does not need this host port mapping. It can scrape cAdvisor directly through the Docker network:

```text
http://cadvisor:8080/metrics
```

The existing application services are:

| Service | Internal target | Monitoring role |
| --- | --- | --- |
| `backend` | `backend:3000` | Exposes HTTP, auth, game, socket, and custom metrics |
| `postgres` | `postgres:5432` | Main database |
| `nginx` | `nginx:80` | Public local gateway |
| `frontend` | `frontend:5173` | Vite development server |

## Backend Metrics

The backend should expose a Prometheus endpoint at:

```text
GET /metrics
```

Nginx must not expose this endpoint publicly. Prometheus should scrape it directly:

```text
http://backend:3000/metrics
```

Required application metrics:

| Metric | Type | Labels | Description |
| --- | --- | --- | --- |
| `http_requests_total` | Counter | `method`, `route`, `status_code` | Total HTTP requests handled by the backend |
| `http_request_duration_seconds` | Histogram | `method`, `route`, `status_code` | HTTP request duration |
| `user_operation_total` | Counter | `operation`, `status` | Result count for auth/profile/friend operations |
| `socket_connections_active` | Gauge | none | Current active Socket.IO connections |
| `socket_events_total` | Counter | `event`, `status` | Socket.IO event results |

Routes must be normalized before they are used as labels.

Use:

```text
/me/friends/:userId
/users/:userId
/games/:gameId
```

Do not use raw request paths such as:

```text
/me/friends/2e53e971-28ce-436b-ba89-062d
```

## User Operation Metrics

`user_operation_total` should cover operations that already exist in the backend:

| Operation | Related route |
| --- | --- |
| `register` | `POST /users/register` |
| `login` | `POST /users/login` |
| `refresh` | `POST /users/refresh` |
| `logout` | `POST /users/logout` |
| `get_profile` | `GET /me` |
| `update_profile` | `PATCH /me` |
| `list_friends` | `GET /me/friends` |
| `create_friend_request` | `POST /me/friends` |
| `update_friendship` | `PATCH /me/friends/:userId` |
| `delete_friendship` | `DELETE /me/friends` |

`DELETE /me/friends` receives the target `userId` in the request body.

Allowed `status` values:

```text
success
failure
```

## Socket Metrics

Socket.IO metrics should cover connection state and game/chat events.

Current socket modules:

| Module | File |
| --- | --- |
| Socket setup | `backend/src/sockets/setup.ts` |
| Game socket handlers | `backend/src/sockets/game.ts` |
| Chat socket handlers | `backend/src/sockets/chat.ts` |

Use stable event names as labels. Do not use socket IDs, user IDs, game IDs, room IDs, IP addresses, usernames, emails, tokens, or message text as labels.

## Infrastructure Metrics

Because the project runs locally, infrastructure metrics can differ between team members. CPU, memory, and network values depend on each developer's machine, Docker setup, and operating system.

cAdvisor should provide container metrics:

| Metric | Description |
| --- | --- |
| `container_cpu_usage_seconds_total` | Container CPU usage |
| `container_memory_usage_bytes` | Container memory usage |
| `container_network_receive_bytes_total` | Received network traffic |
| `container_network_transmit_bytes_total` | Transmitted network traffic |

postgres-exporter should provide PostgreSQL metrics:

| Metric group | Description |
| --- | --- |
| Database availability | Whether PostgreSQL is reachable |
| Active connections | Current database connection count |
| Transaction/query counters | Database activity |
| Locks and deadlocks | Database contention indicators |

Exact metric names depend on the exporter version and should be verified after implementation.

## Dashboards

Grafana should include these dashboards:

| Dashboard | Panels |
| --- | --- |
| Backend API | Request rate, status codes, response time, slow routes |
| Auth and Users | Login/register/refresh/logout/profile/friend operation results |
| Realtime | Active socket connections, socket events, socket failures |
| PostgreSQL | Availability, connections, query activity, locks |
| Docker Infrastructure | CPU, memory, network traffic per container |

## Alerts

Initial alert rules:

| Alert | Source |
| --- | --- |
| Backend metrics target is down | `up{job="backend"} == 0` |
| PostgreSQL exporter is down | `up{job="postgres-exporter"} == 0` |
| High backend 5xx rate | `http_requests_total` |
| High backend response time | `http_request_duration_seconds` |
| Socket disconnect/error spike | `socket_events_total` |

Thresholds should be tuned for local development after metrics are available.

## Label Rules

Metric labels must stay low-cardinality and must not contain sensitive data.

Never use these values as labels:

| Forbidden label value | Reason |
| --- | --- |
| User IDs, game IDs, room IDs, socket IDs | High cardinality |
| Emails, usernames, tokens, IP addresses | Sensitive data |
| Raw URLs or query strings | High cardinality and possible sensitive data |
| Request bodies or chat messages | Sensitive data |
| Session IDs or refresh tokens | Sensitive data |

## Environment Variables

The monitoring stack should use environment variables for local ports and Grafana credentials.

Planned variables:

| Variable | Purpose |
| --- | --- |
| `PROMETHEUS_PORT` | Local Prometheus port |
| `GRAFANA_PORT` | Local Grafana port |
| `GRAFANA_ADMIN_USER` | Grafana admin username |
| `GRAFANA_ADMIN_PASSWORD` | Grafana admin password |

Real values must be stored only in local `.env` files. Only placeholder values should be added to `.env.example`.

