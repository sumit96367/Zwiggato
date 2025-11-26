# Deployment Guide

This guide covers deploying Zwiggato to various environments.

## Prerequisites

- Docker and Docker Compose installed
- Kubernetes cluster (for K8s deployment)
- kubectl configured
- Terraform installed (for AWS infrastructure)
- AWS CLI configured (for AWS deployment)

## Local Development with Docker Compose

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Zwiggato
   ```

2. **Create environment files**
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env with your configuration
   ```

3. **Start services**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - MongoDB: localhost:27017

5. **Stop services**
   ```bash
   docker-compose down
   ```

## Kubernetes Deployment

### 1. Prepare Kubernetes Cluster

Ensure you have a Kubernetes cluster running and kubectl configured.

### 2. Update Configuration

Edit the following files with your values:
- `k8s/configmap.yaml` - Environment variables
- `k8s/secrets.yaml` - Sensitive data (JWT secrets, DB credentials)

### 3. Build and Push Docker Images

```bash
# Build backend image
docker build -t zwiggato/backend:latest ./backend
docker push zwiggato/backend:latest

# Build frontend image
docker build -t zwiggato/frontend:latest ./frontend
docker push zwiggato/frontend:latest
```

### 4. Deploy to Kubernetes

```bash
# Apply all manifests
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/mongodb-pvc.yaml
kubectl apply -f k8s/mongodb-deployment.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml

# Or apply all at once
kubectl apply -f k8s/
```

### 5. Check Deployment Status

```bash
# Check pods
kubectl get pods -n zwiggato

# Check services
kubectl get services -n zwiggato

# Check logs
kubectl logs -f deployment/zwiggato-backend -n zwiggato
kubectl logs -f deployment/zwiggato-frontend -n zwiggato
```

### 6. Access the Application

Get the LoadBalancer IP:
```bash
kubectl get service zwiggato-frontend-service -n zwiggato
```

Access the frontend using the EXTERNAL-IP.

## AWS Infrastructure with Terraform

### 1. Initialize Terraform

```bash
cd terraform
terraform init
```

### 2. Plan Infrastructure

```bash
terraform plan
```

### 3. Apply Infrastructure

```bash
terraform apply
```

This will create:
- VPC with public and private subnets
- Security groups
- S3 bucket for static assets
- Internet Gateway
- Route tables

### 4. Output Values

```bash
terraform output
```

### 5. Destroy Infrastructure

```bash
terraform destroy
```

## CI/CD Pipeline

The GitHub Actions workflow automatically:
1. Runs tests on push/PR
2. Builds Docker images
3. Pushes images to Docker Hub
4. Deploys to Kubernetes (on main branch)

### Setup GitHub Secrets

Add the following secrets to your GitHub repository:
- `DOCKER_USERNAME` - Docker Hub username
- `DOCKER_PASSWORD` - Docker Hub password
- `KUBECONFIG` - Base64 encoded kubeconfig file

### Manual Deployment

If you need to deploy manually:

```bash
# Build images
docker build -t zwiggato/backend:latest ./backend
docker build -t zwiggato/frontend:latest ./frontend

# Push to registry
docker push zwiggato/backend:latest
docker push zwiggato/frontend:latest

# Deploy to Kubernetes
kubectl apply -f k8s/
kubectl rollout restart deployment/zwiggato-backend -n zwiggato
kubectl rollout restart deployment/zwiggato-frontend -n zwiggato
```

## Production Checklist

- [ ] Update all secrets in `k8s/secrets.yaml`
- [ ] Configure proper JWT secrets
- [ ] Set up MongoDB with authentication
- [ ] Configure HTTPS/TLS certificates
- [ ] Set up monitoring (Prometheus, Grafana)
- [ ] Configure log aggregation
- [ ] Set up backup for MongoDB
- [ ] Configure auto-scaling policies
- [ ] Set up alerting
- [ ] Review security groups and firewall rules
- [ ] Enable rate limiting
- [ ] Configure CORS properly
- [ ] Set up CDN for static assets
- [ ] Configure database connection pooling
- [ ] Set up health check endpoints
- [ ] Configure graceful shutdown
- [ ] Review resource limits

## Troubleshooting

### Backend not starting
- Check MongoDB connection string
- Verify environment variables
- Check logs: `kubectl logs -f deployment/zwiggato-backend -n zwiggato`

### Frontend not loading
- Check backend API URL in frontend config
- Verify CORS settings
- Check nginx logs: `kubectl logs -f deployment/zwiggato-frontend -n zwiggato`

### Database connection issues
- Verify MongoDB service is running
- Check network policies
- Verify connection string in ConfigMap

### Image pull errors
- Ensure images are pushed to registry
- Check image pull secrets
- Verify image names in deployment manifests

