# Monitoring

Local monitoring for `ft_transcendence` provides:

- backend application metrics;
- a provisioned Grafana dashboard;
- lightweight availability checks for the main services;
- optional Telegram notifications when a service becomes unavailable or recovers.

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
| Visualization | Provisioned Backend Metrics Grafana dashboard |
| HTTP availability | Nginx, frontend, backend |
| TCP availability | PostgreSQL |
| Alert rule | `ServiceUnavailable` |
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

This is a development-only noise-control rule. Before the final project
submission, choose one explicit alerting mode:

- remove the `alerts` profile from Alertmanager so it starts with the regular
  stack; or
- keep the profile and include `make alerts-up` in the final startup and demo
  procedure.

The current Blackbox HTTP targets are also intended for local development.
After HTTPS is configured at the Nginx gateway, change the Nginx availability
target from `http://nginx/health` to the final HTTPS endpoint and validate its
TLS certificate. The `ServiceUnavailable` rule does not need to change because
it still evaluates `probe_success`. Internal frontend and backend probes should
remain HTTP unless those containers are also configured to terminate TLS.

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

Metric labels must remain low-cardinality. Do not use user IDs, game IDs, room
IDs, socket IDs, email addresses, usernames, tokens, IP addresses, raw query
strings, or message content as labels.

## Availability Checks

Blackbox Exporter defines two modules:

| Module | Probe | Timeout |
| --- | --- | --- |
| `http_2xx` | Successful HTTP `2xx` response over IPv4 | 5 seconds |
| `tcp_connect` | Successful TCP connection | 5 seconds |

Prometheus runs the following checks every 30 seconds:

| Service label | Target | Module |
| --- | --- | --- |
| `nginx` | `http://nginx/health` | `http_2xx` |
| `frontend` | `http://frontend:5173/` | `http_2xx` |
| `backend` | `http://backend:3000/metrics` | `http_2xx` |
| `postgres` | `postgres:5432` | `tcp_connect` |

The result is exposed as:

```text
probe_success = 1  # available
probe_success = 0  # unavailable
```

The frontend check performs one HTTP request only. It does not execute
JavaScript or load assets. The backend check uses the rate-limit-excluded
`/metrics` route. The PostgreSQL check opens a TCP connection without running
queries. None of the checks use `/socket.io`.

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

All four results should normally equal `1`.

## Alert Rule

Prometheus defines one availability rule:

```promql
probe_success{job="blackbox"} == 0
```

The `ServiceUnavailable` alert becomes active after a check remains unsuccessful
for 30 seconds. The alert inherits the `service` label, so Alertmanager can send
separate messages for `nginx`, `frontend`, `backend`, and `postgres`.

Alert delivery timing is intentionally conservative for local development:

| Setting | Value | Purpose |
| --- | --- | --- |
| Blackbox scrape interval | 30 seconds | Limits probe traffic |
| Probe timeout | 5 seconds | Bounds each check |
| Alert `for` | 30 seconds | Ignores very short failures |
| Alertmanager `group_wait` | 10 seconds | Groups initial notifications |
| Alertmanager `group_interval` | 30 seconds | Delivers state changes promptly |
| Alertmanager `repeat_interval` | 4 hours | Avoids repeated notification noise |

Depending on scrape alignment, a firing notification normally arrives in about
40–70 seconds. Resolved notifications are enabled.

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

The dashboard covers backend request rate, response status, latency, slow routes,
5xx responses, and user operations. Availability probes are used for alerting
and can be inspected directly in Prometheus; they do not require a separate
Grafana dashboard.

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

Check the host health endpoint:

```bash
curl -i http://localhost:${NGINX_PORT}/health
```

If it does not return `200 OK`, rebuild the Nginx image so it contains the latest
`nginx.conf`.

### Configuration changes are not loaded

Prometheus and Alertmanager do not automatically apply every bind-mounted file
change in this local setup. Restart the affected container after validation:

```bash
docker restart ft-prometheus
docker restart ft-alertmanager
```
