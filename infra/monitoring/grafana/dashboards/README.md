# Grafana Dashboards

This directory contains Grafana dashboard JSON files.

Grafana reads this directory because it is referenced from:

```text
infra/monitoring/grafana/provisioning/dashboards/dashboards.yml
```

Inside the Grafana container, this directory is mounted as:

```text
/var/lib/grafana/dashboards
```

## Current Status

The backend metrics dashboard is added:

```text
backend-api.json
```

Provisioning is already prepared:

| File | Purpose |
| --- | --- |
| `../provisioning/datasources/prometheus.yml` | Adds Prometheus as a Grafana datasource |
| `../provisioning/dashboards/dashboards.yml` | Tells Grafana to load dashboards from this directory |

## Dashboards

| Dashboard | Purpose | File |
| --- | --- | --- |
| Backend Metrics | Request rate, status codes, response time, slow routes, user operations, 5xx rate | `backend-api.json` |

## Planned Dashboards

| Dashboard | Purpose |
| --- | --- |
| Auth and Users | Login/register/refresh/logout/profile/friend operation results |
| Realtime | Socket.IO connections, events, and failures |
| PostgreSQL | Availability, connections, query activity, locks |
| Docker Infrastructure | CPU, memory, and network traffic per container |

Add exported Grafana dashboard JSON files directly into this directory.
