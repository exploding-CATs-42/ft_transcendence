# Grafana Dashboards

This directory is reserved for Grafana dashboard JSON files.

Grafana reads this directory because it is referenced from:

```text
infra/monitoring/grafana/provisioning/dashboards/dashboards.yml
```

Inside the Grafana container, this directory is mounted as:

```text
/var/lib/grafana/dashboards
```

## Current Status

No real dashboard JSON files are added yet.

Provisioning is already prepared:

| File | Purpose |
| --- | --- |
| `../provisioning/datasources/prometheus.yml` | Adds Prometheus as a Grafana datasource |
| `../provisioning/dashboards/dashboards.yml` | Tells Grafana to load dashboards from this directory |

## Planned Dashboards

| Dashboard | Purpose |
| --- | --- |
| Backend API | Request rate, status codes, response time, slow routes |
| Auth and Users | Login/register/refresh/logout/profile/friend operation results |
| Realtime | Socket.IO connections, events, and failures |
| PostgreSQL | Availability, connections, query activity, locks |
| Docker Infrastructure | CPU, memory, and network traffic per container |

Add exported Grafana dashboard JSON files directly into this directory.
