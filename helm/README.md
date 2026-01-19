# Budget Scanner Helm Chart

This Helm chart deploys the Budget Scanner application on Kubernetes. Budget Scanner is a personal finance tracking application for analyzing ZKB bank statements with automatic transaction categorization.

## Components

The chart deploys:
- **Budget Scanner App** - Node.js Express backend serving React frontend (port 3001)
- **MongoDB** - Database for storing transactions and settings (port 27017)

## Prerequisites

- Kubernetes 1.19+
- Helm 3.0+
- PV provisioner support (for MongoDB persistence)

## Quick Start

```bash
# Install with default settings
helm install budgetscanner ./budgetscanner

# Access via port-forward
kubectl port-forward svc/budgetscanner 8080:80
# Open http://localhost:8080
```

## Installation

### Basic Installation

```bash
helm install budgetscanner ./budgetscanner
```

### Custom Image

```bash
helm install budgetscanner ./budgetscanner \
  --set app.image.repository=your-registry/budgetscanner \
  --set app.image.tag=v1.0.0
```

### With Ingress

```bash
helm install budgetscanner ./budgetscanner \
  --set ingress.enabled=true \
  --set ingress.className=nginx \
  --set "ingress.hosts[0].host=budget.example.com" \
  --set "ingress.hosts[0].paths[0].path=/" \
  --set "ingress.hosts[0].paths[0].pathType=Prefix"
```

### With TLS

```bash
helm install budgetscanner ./budgetscanner \
  --set ingress.enabled=true \
  --set ingress.className=nginx \
  --set "ingress.hosts[0].host=budget.example.com" \
  --set "ingress.hosts[0].paths[0].path=/" \
  --set "ingress.hosts[0].paths[0].pathType=Prefix" \
  --set "ingress.tls[0].secretName=budgetscanner-tls" \
  --set "ingress.tls[0].hosts[0]=budget.example.com"
```

### With MongoDB Authentication

```bash
helm install budgetscanner ./budgetscanner \
  --set mongodb.auth.enabled=true \
  --set mongodb.auth.rootUsername=admin \
  --set mongodb.auth.rootPassword=secretpassword
```

### Using External MongoDB

```bash
helm install budgetscanner ./budgetscanner \
  --set mongodb.enabled=false \
  --set app.env.mongodbUri=mongodb://external-host:27017/budgetscanner
```

## Configuration

### Application Settings

| Parameter | Description | Default |
|-----------|-------------|---------|
| `app.replicaCount` | Number of app replicas | `1` |
| `app.image.repository` | App image repository | `budgetscanner` |
| `app.image.tag` | App image tag | `latest` |
| `app.image.pullPolicy` | Image pull policy | `IfNotPresent` |
| `app.service.type` | Service type | `ClusterIP` |
| `app.service.port` | Service port | `80` |
| `app.env.port` | Container port | `3001` |
| `app.env.nodeEnv` | Node environment | `production` |
| `app.resources.limits.cpu` | CPU limit | `500m` |
| `app.resources.limits.memory` | Memory limit | `512Mi` |
| `app.resources.requests.cpu` | CPU request | `100m` |
| `app.resources.requests.memory` | Memory request | `128Mi` |

### MongoDB Settings

| Parameter | Description | Default |
|-----------|-------------|---------|
| `mongodb.enabled` | Deploy MongoDB | `true` |
| `mongodb.image.repository` | MongoDB image | `mongo` |
| `mongodb.image.tag` | MongoDB version | `7.0` |
| `mongodb.service.port` | MongoDB port | `27017` |
| `mongodb.auth.enabled` | Enable authentication | `false` |
| `mongodb.auth.rootUsername` | Root username | `root` |
| `mongodb.auth.rootPassword` | Root password | `""` |
| `mongodb.auth.database` | Database name | `budgetscanner` |
| `mongodb.persistence.enabled` | Enable persistence | `true` |
| `mongodb.persistence.size` | Storage size | `8Gi` |
| `mongodb.persistence.storageClass` | Storage class | `""` |

### Ingress Settings

| Parameter | Description | Default |
|-----------|-------------|---------|
| `ingress.enabled` | Enable ingress | `false` |
| `ingress.className` | Ingress class name | `""` |
| `ingress.annotations` | Ingress annotations | `{}` |
| `ingress.hosts` | Ingress hosts | `[{host: budgetscanner.local, paths: [{path: /, pathType: Prefix}]}]` |
| `ingress.tls` | TLS configuration | `[]` |

### Autoscaling Settings

| Parameter | Description | Default |
|-----------|-------------|---------|
| `app.autoscaling.enabled` | Enable HPA | `false` |
| `app.autoscaling.minReplicas` | Minimum replicas | `1` |
| `app.autoscaling.maxReplicas` | Maximum replicas | `5` |
| `app.autoscaling.targetCPUUtilizationPercentage` | Target CPU % | `80` |

## Upgrading

```bash
helm upgrade budgetscanner ./budgetscanner
```

## Uninstalling

```bash
helm uninstall budgetscanner
```

**Note:** The MongoDB PersistentVolumeClaim is not deleted automatically. To remove it:

```bash
kubectl delete pvc budgetscanner-mongodb-data
```

## Health Checks

The application exposes a health endpoint at `/api/health` used for liveness and readiness probes.

## API Documentation

Swagger UI is available at `/api-docs` once the application is running.

## Troubleshooting

### Check pod status
```bash
kubectl get pods -l app.kubernetes.io/instance=budgetscanner
```

### View application logs
```bash
kubectl logs -l app.kubernetes.io/name=budgetscanner -f
```

### View MongoDB logs
```bash
kubectl logs -l app.kubernetes.io/name=budgetscanner-mongodb -f
```

### Check MongoDB connection
```bash
kubectl exec -it $(kubectl get pod -l app.kubernetes.io/name=budgetscanner-mongodb -o jsonpath='{.items[0].metadata.name}') -- mongosh --eval "db.adminCommand('ping')"
```
