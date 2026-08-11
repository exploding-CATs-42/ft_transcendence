# Grafana Dashboards

This directory contains Grafana dashboard JSON files provisioned by the local
monitoring stack.

## Provisioning

Grafana loads dashboards from this directory through:

```text
infra/monitoring/grafana/provisioning/dashboards/dashboards.yml
```

The directory is mounted inside the Grafana container as:

```text
/var/lib/grafana/dashboards
```

The provisioned Prometheus datasource is defined in:

```text
infra/monitoring/grafana/provisioning/datasources/prometheus.yml
```

Its stable UID is `prometheus`, which dashboard JSON files should use for panel
queries.

## Current Dashboard

| Dashboard | File | Content |
| --- | --- | --- |
| Health | `backend-api.json` | Nine panels covering edge availability, active critical alerts, global and per-route p95 latency, account and game operation outcomes, HTTP response classes, and request rate |

The dashboard presents the user-facing health of the application and follows
the RED monitoring method:

- **Rate:** backend requests per second.
- **Errors:** HTTP response classes and failed account or game operations.
- **Duration:** global and per-route p95 request latency.

Blackbox Exporter checks whether users can reach the frontend and backend
through the external HTTPS Nginx entry point. Prometheus alert state is also
shown directly on the dashboard.

The dashboard is intentionally focused on user-visible signals. Container CPU,
memory, and filesystem panels are omitted because they would require additional
exporters without improving the required evaluation scenarios.

## Updating a Dashboard

The dashboard is provisioned from Git and should be treated as code. UI edits
are useful for experimentation but are not the source of truth. Export the
finished dashboard JSON and replace the corresponding file in this directory.
Keep the datasource UID as `prometheus`, then restart Grafana if the
provisioned version is not refreshed automatically:

```bash
docker restart ft-grafana
```

Do not place credentials, tokens, user data, or environment-specific hostnames
in dashboard JSON files.
