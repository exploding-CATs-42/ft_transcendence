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
| Backend Metrics | `backend-api.json` | Request rate, status codes, response time, slow routes, 5xx responses, and user operations |

The dashboard visualizes backend application metrics collected from
`backend:3000/metrics`.

Service availability is checked by Blackbox Exporter and used by the
`ServiceUnavailable` Prometheus alert. Availability can be inspected with the
following Prometheus query and does not require a separate Grafana dashboard:

```promql
probe_success{job="blackbox"}
```

## Updating a Dashboard

Export the updated dashboard as JSON and replace the corresponding file in this
directory. Keep the provisioned datasource UID as `prometheus`, then restart
Grafana if the provisioned version is not refreshed automatically:

```bash
docker restart ft-grafana
```

Do not place credentials, tokens, user data, or environment-specific hostnames
in dashboard JSON files.
