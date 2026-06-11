# Monitoring

Local monitoring setup for `ft_transcendence`.

The stack is based on Prometheus and Grafana. Prometheus collects metrics. Grafana uses Prometheus as a datasource and displays dashboards.

## Current Status

| Area | Status |
| --- | --- |
| Prometheus Docker service | Added |
| Prometheus config | Added in `infra/monitoring/prometheus/prometheus.yml` |
| Prometheus alert rules file | Added in `infra/monitoring/prometheus/alerts.yml` |
| Grafana Docker service | Added |
| Grafana Prometheus datasource provisioning | Added |
| Grafana dashboard provisioning | Added |
| Backend Grafana dashboard JSON | Added in `infra/monitoring/grafana/dashboards/backend-api.json` |
| Backend `/metrics` endpoint | Implemented |
| cAdvisor | Not added yet |
| postgres-exporter | Not added yet |

## Services

| Service | Internal target | Host access | Purpose |
| --- | --- | --- | --- |
| `prometheus` | `prometheus:9090` | `localhost:${PROMETHEUS_PORT}` | Scrapes and stores metrics |
| `grafana` | `grafana:3000` | `localhost:${GRAFANA_PORT}` | Displays dashboards |
| `backend` | `backend:3000` | via Nginx | Application metrics source |
| `postgres` | `postgres:5432` | `localhost:${POSTGRES_PORT}` | Main database |
| `nginx` | `nginx:80` | `localhost:${NGINX_PORT}` | Public local gateway |

`Internal target` means `service_name:container_port` inside the Docker network. It is not the same as a host port published with `ports`.

Example:

```text
prometheus:9090
grafana:3000
backend:3000
```

## Files

```text
infra/monitoring/
  README.md
  prometheus/
    prometheus.yml
    alerts.yml
  grafana/
    provisioning/
      datasources/
        prometheus.yml
      dashboards/
        dashboards.yml
    dashboards/
      README.md
      backend-api.json
```

`grafana/provisioning/dashboards/dashboards.yml` tells Grafana where dashboard JSON files are located.

`grafana/dashboards/` contains provisioned dashboard JSON files.

## Environment Variables

Monitoring variables are stored in `infra/env/.env` and listed as placeholders in `infra/env/.env.example`.

| Variable | Purpose |
| --- | --- |
| `PROMETHEUS_PORT` | Host port for Prometheus |
| `GRAFANA_PORT` | Host port for Grafana |
| `GRAFANA_ADMIN_USER` | Project-level Grafana admin username value |
| `GRAFANA_ADMIN_PASSWORD` | Project-level Grafana admin password value |

The official Grafana image reads admin credentials from:

```text
GF_SECURITY_ADMIN_USER
GF_SECURITY_ADMIN_PASSWORD
```

If the project keeps `GRAFANA_ADMIN_USER` and `GRAFANA_ADMIN_PASSWORD` in `.env`, Docker Compose must map them to `GF_SECURITY_ADMIN_USER` and `GF_SECURITY_ADMIN_PASSWORD` for Grafana to use them.

Real values belong only in local `.env` files. `.env.example` should contain placeholders only.

## Prometheus

Prometheus config:

```text
infra/monitoring/prometheus/prometheus.yml
```

Alert rules file:

```text
infra/monitoring/prometheus/alerts.yml
```

Prometheus scrape targets must use internal Docker targets with ports.

Correct:

```yaml
targets: ["prometheus:9090"]
targets: ["backend:3000"]
```

Wrong:

```yaml
targets: ["prometheus"]
```

Without the port, Prometheus tries to scrape port `80`.

Prometheus stores local time-series data in the `prometheus_data` Docker volume.

## Grafana

Grafana provisioning files:

```text
infra/monitoring/grafana/provisioning/datasources/prometheus.yml
infra/monitoring/grafana/provisioning/dashboards/dashboards.yml
```

The datasource config should point to Prometheus through the Docker network:

```yaml
uid: prometheus
url: http://prometheus:9090
```

The dashboard provider should point to the dashboard JSON directory inside the Grafana container:

```yaml
options:
  path: /var/lib/grafana/dashboards
```

## Backend Metrics

The backend exposes:

```text
GET /metrics
```

Prometheus should scrape it through the Docker network:

```text
http://backend:3000/metrics
```

Nginx does not expose `/api/metrics` publicly. The public gateway returns `404` for that path.

Implemented application metrics:

| Metric | Type | Labels | Description |
| --- | --- | --- | --- |
| `http_requests_total` | Counter | `method`, `route`, `status_code` | Backend HTTP request count |
| `http_request_duration_seconds` | Histogram | `method`, `route`, `status_code` | Backend HTTP request duration |
| `user_operation_total` | Counter | `operation`, `status` | Auth/profile/friend operation results |

Planned application metrics:

| Metric | Type | Labels | Description |
| --- | --- | --- | --- |
| `socket_connections_active` | Gauge | none | Active Socket.IO connections |
| `socket_events_total` | Counter | `event`, `status` | Socket.IO event results |

Routes used as labels must be normalized.

Use:

```text
/me/friends/:userId
/users/:userId
/games/:gameId
```

Do not use raw paths with real IDs:

```text
/me/friends/2e53e971-28ce-436b-ba89-062d
```

## User Operation Metrics

`user_operation_total` should cover existing backend operations:

| Operation | Route |
| --- | --- |
| `register` | `POST /auth/register` |
| `login` | `POST /auth/login` |
| `refresh` | `POST /auth/refresh` |
| `logout` | `POST /auth/logout` |
| `get_profile` | `GET /me` |
| `update_profile` | `PATCH /me` |
| `list_friends` | `GET /me/friends` |
| `create_friend_request` | `POST /me/friends` |
| `update_friendship` | `PATCH /me/friends/:userId` |
| `delete_friendship` | `DELETE /me/friends` |

`DELETE /me/friends` receives the target `userId` in the request body.

Allowed metric statuses:

```text
success
failure
```

## Socket Metrics

Socket.IO metrics should cover connection state and game events.

Current socket modules:

| Module | File |
| --- | --- |
| Socket setup | `backend/src/sockets/setup.ts` |
| Game handlers | `backend/src/sockets/listeners/gameListeners.ts` |

Use stable event names as labels. Do not use socket IDs, user IDs, game IDs, room IDs, IP addresses, usernames, emails, tokens, or message text as labels.

## Infrastructure Metrics

Because the project runs locally, infrastructure metrics can differ between team members. CPU, memory, and network values depend on each developer's machine, Docker setup, and operating system.

Planned cAdvisor metrics:

| Metric | Description |
| --- | --- |
| `container_cpu_usage_seconds_total` | Container CPU usage |
| `container_memory_usage_bytes` | Container memory usage |
| `container_network_receive_bytes_total` | Received network traffic |
| `container_network_transmit_bytes_total` | Transmitted network traffic |

Planned PostgreSQL exporter metrics:

| Metric group | Description |
| --- | --- |
| Availability | Whether PostgreSQL is reachable |
| Active connections | Current database connection count |
| Transaction/query counters | Database activity |
| Locks and deadlocks | Database contention indicators |

cAdvisor uses container port `8080`, but the project already uses host port `8080` for Nginx.

Do not publish cAdvisor on host port `8080`. If host access is needed, use another host port, for example:

```yaml
ports:
  - "8081:8080"
```

Prometheus can scrape cAdvisor internally without a host port:

```text
http://cadvisor:8080/metrics
```

## Dashboards

Implemented Grafana dashboards:

| Dashboard | Panels |
| --- | --- |
| Backend Metrics | User operations, request rate, status codes, response time, slow routes, 5xx rate |

Planned Grafana dashboards:

| Dashboard | Panels |
| --- | --- |
| Auth and Users | Login/register/refresh/logout/profile/friend operation results |
| Realtime | Active socket connections, socket events, socket failures |
| PostgreSQL | Availability, connections, query activity, locks |
| Docker Infrastructure | CPU, memory, network traffic per container |

## Alerts

Implemented alert rules:

| Alert | Source |
| --- | --- |
| Backend metrics target is down | `up{job="backend"} == 0` |
| High backend 5xx rate | `http_requests_total` |

Planned alert rules:

| Alert | Source |
| --- | --- |
| PostgreSQL exporter is down | `up{job="postgres-exporter"} == 0` |
| High backend response time | `http_request_duration_seconds` |
| Socket disconnect/error spike | `socket_events_total` |

Thresholds should be tuned for local development after metrics are available.

## Label Rules

Metric labels must stay low-cardinality and must not contain sensitive data.

Never use these values as labels:

| Forbidden value | Reason |
| --- | --- |
| User IDs, game IDs, room IDs, socket IDs | High cardinality |
| Emails, usernames, tokens, IP addresses | Sensitive data |
| Raw URLs or query strings | High cardinality and possible sensitive data |
| Session IDs or refresh tokens | Sensitive data |
