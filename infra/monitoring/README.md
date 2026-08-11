# Monitoring

Local monitoring for `ft_transcendence` provides:

- backend application metrics;
- a provisioned user-facing health dashboard;
- external HTTPS and internal availability checks;
- Prometheus alert rules for availability, user operations, and latency;
- optional Telegram notifications when an alert fires or resolves.

The setup intentionally stays small for local development. It does not collect
container CPU or memory metrics and does not probe game or Socket.IO traffic.

## Architecture

```text
backend /metrics ────────────────┐
                                 ├─> Prometheus ─> Grafana
Blackbox availability probes ────┘       │
                                         └─> alert rules
                                              │
                                              v
                                      Alertmanager (optional)
                                              │
                                              v
                                           Telegram
```

Prometheus stores metrics and evaluates alert rules. Grafana reads Prometheus
data. Blackbox Exporter checks network availability. Alertmanager only routes
active and resolved alerts; it does not perform checks itself.

## Scope

| Area | Implementation |
| --- | --- |
| Application metrics | Backend `GET /metrics` |
| Visualization | Provisioned Health Grafana dashboard |
| Edge availability | Frontend and backend through HTTPS Nginx |
| Internal diagnostics | Nginx, frontend, backend, and PostgreSQL probes |
| TCP availability | PostgreSQL |
| Alert rules | `ServiceUnavailable`, `UserOperationsFailing`, `BackendLatencyHigh` |
| Notifications | Optional Telegram receiver |

The monitoring scope does not include cAdvisor, postgres-exporter, host resource
metrics, Socket.IO alerts, or automatic paging.

## Services

| Service | Internal target | Host access | Purpose |
| --- | --- | --- | --- |
| `prometheus` | `prometheus:9090` | `localhost:${PROMETHEUS_PORT}` | Scrapes metrics and evaluates rules |
| `grafana` | `grafana:3000` | `localhost:${GRAFANA_PORT}` | Displays the backend dashboard |
| `blackbox` | `blackbox:9115` | Internal only | Runs HTTP and TCP availability probes |
| `alertmanager` | `alertmanager:9093` | Internal only | Sends optional Telegram notifications |
| `backend` | `backend:3000` | Via Nginx | Exposes application metrics |

An internal target uses the Docker service name and container port. It is not a
host address. For example, Prometheus reaches Blackbox Exporter at
`blackbox:9115`, while that port is not published on the developer's machine.

## Files

```text
infra/monitoring/
  README.md
  alertmanager/
    alertmanager.yml
  blackbox/
    blackbox.yml
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

Docker services and mounts are defined in:

```text
infra/docker/compose.dev.yml
```

## Local Configuration

Monitoring environment variables are stored in `infra/env/.env`. Placeholder
names are listed in `infra/env/.env.example`.

| Variable | Purpose |
| --- | --- |
| `PROMETHEUS_PORT` | Prometheus host port |
| `GRAFANA_PORT` | Grafana host port |
| `GF_SECURITY_ADMIN_USER` | Grafana administrator username |
| `GF_SECURITY_ADMIN_PASSWORD` | Grafana administrator password |

Real values belong only in local environment files.

### Telegram secrets

Alertmanager reads the Telegram credentials from two local files:

```text
infra/secrets/telegram_bot_token
infra/secrets/telegram_chat_id
```

Each file contains only its value, without a variable name, quotes, or YAML.
For example, `telegram_chat_id` contains the negative numeric group ID.

Docker Compose mounts the files inside Alertmanager as:

```text
/run/secrets/telegram_bot_token
/run/secrets/telegram_chat_id
```

The complete `infra/secrets/` directory is ignored by Git. Never commit the bot
token or paste it into configuration, logs, issues, or documentation. Team
members must create or receive these files separately.

Alertmanager uses files instead of `${VARIABLE}` placeholders because its YAML
configuration reads Telegram credentials through `telegram_bot_token_file` and
`chat_id_file`.

## Running the Stack

Start the regular development stack:

```bash
make up
```

Blackbox Exporter starts with the regular stack. Alertmanager belongs to the
`alerts` Compose profile and stays off by default, so normal development does
not send Telegram messages.

This profile prevents development notifications from becoming noisy. Start it
explicitly before an alerting demonstration.

Enable notifications when testing:

```bash
make alerts-up
```

Check the notification service:

```bash
make alerts-status
```

Disable notifications after testing:

```bash
make alerts-down
```

Prometheus and Grafana continue running when Alertmanager is stopped.

## Backend Metrics

The backend exposes Prometheus text metrics at:

```text
GET /metrics
```

Prometheus scrapes the endpoint through the Docker network:

```text
http://backend:3000/metrics
```

Nginx intentionally returns `404` for public `/api/metrics` requests, so metrics
are not exposed through the public gateway. The backend rate limiter also
excludes `/metrics`.

Implemented application metrics:

| Metric | Type | Labels | Purpose |
| --- | --- | --- | --- |
| `http_requests_total` | Counter | `method`, `route`, `status_code` | Request count |
| `http_request_duration_seconds` | Histogram | `method`, `route`, `status_code` | Request duration |
| `user_operation_total` | Counter | `operation`, `status` | Auth, profile, and friend operation results |
| `game_operation_total` | Counter | `operation`, `status` | Socket.IO game operation results |

Metric labels must remain low-cardinality. Do not use user IDs, game IDs, room
IDs, socket IDs, email addresses, usernames, tokens, IP addresses, raw query
strings, or message content as labels.

## Availability Checks

Blackbox Exporter defines three modules:

| Module | Probe | Timeout |
| --- | --- | --- |
| `http_2xx` | Successful HTTP `2xx` response over IPv4 | 5 seconds |
| `https_2xx_self_signed` | Successful HTTPS `2xx` response using the local certificate | 5 seconds |
| `tcp_connect` | Successful TCP connection | 5 seconds |

Prometheus runs the following checks every 30 seconds:

| Service and layer labels | Target | Module |
| --- | --- | --- |
| `nginx`, `edge` | `https://nginx/health` | `https_2xx_self_signed` |
| `frontend`, `edge` | `https://nginx/` | `https_2xx_self_signed` |
| `backend`, `edge` | `https://nginx/api` | `https_2xx_self_signed` |
| `frontend`, `internal` | `http://frontend:5173/` | `http_2xx` |
| `backend`, `internal` | `http://backend:3000/metrics` | `http_2xx` |
| `postgres`, `dependency` | `postgres:5432` | `tcp_connect` |

The result is exposed as:

```text
probe_success = 1  # available
probe_success = 0  # unavailable
```

The edge probes represent the real user path through HTTPS Nginx. Internal
probes help distinguish a gateway problem from an application-container
problem. Each frontend check performs one HTTP request without executing
JavaScript or loading assets. The internal backend check uses the
rate-limit-excluded `/metrics` route. The PostgreSQL check opens a TCP
connection without running queries. None of the checks use `/socket.io`.

Nginx provides a direct `/health` response that does not proxy to frontend or
backend. This prevents a frontend outage from producing a false Nginx alert.
Because `nginx.conf` is copied into the image, rebuild Nginx after changing that
file:

```bash
docker compose \
  --env-file infra/env/.env \
  -f infra/docker/compose.dev.yml \
  up -d --build --no-deps nginx
```

Inspect current availability in Prometheus with:

```promql
probe_success{job="blackbox"}
```

All six results should normally equal `1`.

## Alert Rules

Prometheus evaluates three user-facing rules:

| Alert | Severity | Condition | Purpose |
| --- | --- | --- | --- |
| `ServiceUnavailable` | critical | Edge frontend or backend probe fails for 30 seconds | Detects that users cannot reach the application |
| `UserOperationsFailing` | critical | At least three account or game operations return server errors within two minutes, sustained for 10 seconds | Detects failures in user-facing workflows |
| `BackendLatencyHigh` | warning | Backend p95 exceeds 500 ms with at least 20 requests in one minute, sustained for 20 seconds | Detects meaningful latency degradation while avoiding low-traffic noise |

The availability alert intentionally uses only `layer="edge"`. Internal probes
remain diagnostic signals and do not create duplicate notifications for the
same user-visible incident.

Alert delivery timing is intentionally conservative for local development:

| Setting | Value | Purpose |
| --- | --- | --- |
| Blackbox scrape interval | 30 seconds | Limits probe traffic |
| Probe timeout | 5 seconds | Bounds each check |
| Availability `for` | 30 seconds | Ignores very short failures |
| Alertmanager `group_wait` | 10 seconds | Groups initial notifications |
| Alertmanager `group_interval` | 30 seconds | Delivers state changes promptly |
| Alertmanager `repeat_interval` | 4 hours | Avoids repeated notification noise |

Depending on scrape alignment, an availability notification normally arrives
in about 40–70 seconds. Resolved notifications are enabled.

The custom Telegram template includes the status, service name, alert name, and
description. It deliberately omits Alertmanager's default `Source` URL because a
container hostname is not usable from Telegram clients.

## Grafana

Grafana receives its datasource and dashboard automatically through provisioning.

Datasource configuration:

```text
infra/monitoring/grafana/provisioning/datasources/prometheus.yml
```

Dashboard provider:

```text
infra/monitoring/grafana/provisioning/dashboards/dashboards.yml
```

Provisioned dashboard:

```text
infra/monitoring/grafana/dashboards/backend-api.json
```

The `Health` dashboard combines edge availability, active critical alerts,
global and per-route p95 latency, account and game operation outcomes, HTTP
response classes, and request rate. These panels cover the RED signals: Rate,
Errors, and Duration.

Grafana administrator credentials come from `infra/env/.env`. Anonymous access
is disabled by Grafana by default. An unauthenticated API request should return
`401 Unauthorized`:

```bash
curl -i http://localhost:${GRAFANA_PORT}/api/search
```

## Safe End-to-End Test

Use frontend for an isolated alert test. Nginx continues to respond through its
independent `/health` endpoint.

1. Enable notifications:

   ```bash
   make alerts-up
   ```

2. Stop frontend:

   ```bash
   docker stop ft-frontend
   ```

3. Wait for a `ServiceUnavailable` message for `frontend` only.

4. Restore frontend:

   ```bash
   docker start ft-frontend
   ```

5. Wait for the `Service recovered` message.

6. Disable notifications:

   ```bash
   make alerts-down
   ```


## Troubleshooting

### No Telegram message

Check that Alertmanager is enabled and inspect its logs:

```bash
make alerts-status
docker logs ft-alertmanager --tail 50
```

Confirm that the two secret files exist locally.

### A probe reports `0`

Open Prometheus targets at `http://localhost:${PROMETHEUS_PORT}/targets` or run
the `probe_success{job="blackbox"}` query. Confirm that the target container is
running and that Blackbox Exporter is attached to `transcendence_net`.

### Nginx fails together with frontend

Check the external HTTPS health endpoint:

```bash
curl -sk -i https://localhost:${NGINX_HTTPS_PORT}/health
```

If it does not return `200 OK`, rebuild the Nginx image so it contains the latest
`nginx.conf`. Nginx resolves the Docker frontend and backend service names
dynamically, so recreating those containers does not require an Nginx restart.

### Configuration changes are not loaded

Prometheus and Alertmanager use file-level bind mounts. Editors may replace a
configuration file with a new inode when saving, while an existing container
continues reading the old mounted inode. Recreate the affected service after
validation so Docker mounts the current file:

```bash
docker compose \
  --env-file infra/env/.env \
  -f infra/docker/compose.dev.yml \
  up -d --force-recreate --no-deps prometheus

docker compose \
  --env-file infra/env/.env \
  -f infra/docker/compose.dev.yml \
  --profile alerts \
  up -d --force-recreate --no-deps alertmanager
```
