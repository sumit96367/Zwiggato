# Zwiggato DevOps Quick Start Guide

Quick reference for setting up the DevOps pipeline for Zwiggato project.

## 🚀 Quick Setup (Using Scripts)

### 1. Jenkins Server Setup

```bash
# SSH to Jenkins server
ssh -i your-key.pem ubuntu@<jenkins-ip>

# Copy setup script
# Or download from repository

# Run setup script
sudo bash setup-jenkins-server.sh

# Get Jenkins password
sudo cat /var/lib/jenkins/secrets/initialAdminPassword

# Access Jenkins: http://<jenkins-ip>:8080
```

### 2. Monitoring Server Setup

```bash
# SSH to Monitoring server
ssh -i your-key.pem ubuntu@<monitoring-ip>

# Run setup script
sudo bash setup-monitoring-server.sh

# Enter Jenkins IP when prompted

# Access Prometheus: http://<monitoring-ip>:9090
# Access Grafana: http://<monitoring-ip>:3000
```

## 📋 Essential Configuration Checklist

### Jenkins Configuration

- [ ] Install plugins:
  - SonarQube Scanner
  - OWASP Dependency-Check
  - Email Extension Plugin
  - Docker Pipeline Plugin
  - Prometheus Metrics Plugin
  - NodeJS Plugin

- [ ] Configure tools:
  - JDK 17: `/usr/lib/jvm/temurin-17-jdk-amd64`
  - NodeJS: Install automatically
  - SonarQube Scanner: Install automatically

- [ ] Add credentials:
  - `Sonar-token`: SonarQube token
  - `docker`: DockerHub credentials

- [ ] Configure SonarQube server:
  - Name: `sonar-server`
  - URL: `http://localhost:9000`
  - Token: `Sonar-token`

- [ ] Configure email (Gmail):
  - SMTP: `smtp.gmail.com`
  - Port: `587`
  - Use App Password

### SonarQube Configuration

- [ ] Access: `http://<jenkins-ip>:9000`
- [ ] Default: `admin/admin` (change password)
- [ ] Create token: Administration → Security → Users → Tokens
- [ ] Create webhook: Administration → Configuration → Webhooks
  - URL: `http://<jenkins-ip>:8080/sonarqube-webhook/`

### Pipeline Configuration

**Before running pipeline:**

1. **Update `Jenkinsfile` or `Jenkinsfile.simple`:**
   ```groovy
   DOCKERHUB_USERNAME = 'your-dockerhub-username'
   to: 'your-email@example.com'
   ```

2. **Update Kubernetes deployments:**
   - `k8s/backend-deployment.yaml`: Update image name
   - `k8s/frontend-deployment.yaml`: Update image name

3. **Create Jenkins pipeline job:**
   - New Item → Pipeline
   - Name: `zwiggato-pipeline`
   - Pipeline from SCM → Git
   - Repository URL: Your GitHub repo
   - Script Path: `Jenkinsfile`

## 🔧 Common Commands

### Jenkins Server

```bash
# Check Jenkins status
sudo systemctl status jenkins

# Restart Jenkins
sudo systemctl restart jenkins

# View Jenkins logs
sudo tail -f /var/log/jenkins/jenkins.log

# Get Jenkins password
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

### Docker

```bash
# Check Docker status
sudo systemctl status docker

# Check Docker images
docker images

# Check running containers
docker ps

# View container logs
docker logs <container-name>

# Remove old containers
docker stop <container-name> && docker rm <container-name>
```

### SonarQube

```bash
# Check SonarQube container
docker ps | grep sonar

# View SonarQube logs
docker logs sonar

# Restart SonarQube
docker restart sonar
```

### Prometheus

```bash
# Check Prometheus status
sudo systemctl status prometheus

# Validate Prometheus config
promtool check config /etc/prometheus/prometheus.yml

# Reload Prometheus config
curl -X POST http://localhost:9090/-/reload

# Check targets
# Visit: http://<monitoring-ip>:9090/targets
```

### Grafana

```bash
# Check Grafana status
sudo systemctl status grafana-server

# Restart Grafana
sudo systemctl restart grafana-server
```

### Kubernetes (EKS)

```powershell
# List clusters
eksctl get cluster --region ap-northeast-1

# List node groups
eksctl get nodegroup --cluster=zwiggato-cluster --region=ap-northeast-1

# Configure kubectl
aws eks update-kubeconfig --region ap-northeast-1 --name zwiggato-cluster

# Check nodes
kubectl get nodes

# Check pods
kubectl get pods -n zwiggato

# Check services
kubectl get svc -n zwiggato

# View logs
kubectl logs <pod-name> -n zwiggato

# Describe pod (for debugging)
kubectl describe pod <pod-name> -n zwiggato
```

### ArgoCD

```powershell
# Check ArgoCD pods
kubectl get pods -n argocd

# Get ArgoCD URL
kubectl get svc argocd-server -n argocd

# Get ArgoCD password (PowerShell)
$env:ARGO_PWD = (kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | % { [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($_)) })
echo $env:ARGO_PWD
```

## 🔍 Troubleshooting Quick Fixes

### Jenkins can't access Docker

```bash
sudo usermod -aG docker jenkins
sudo chmod 777 /var/run/docker.sock
sudo systemctl restart jenkins
```

### Pipeline fails at Docker build

```bash
# Check Docker daemon
sudo systemctl status docker

# Check permissions
ls -la /var/run/docker.sock

# Restart Docker
sudo systemctl restart docker
```

### SonarQube not accessible

```bash
# Check container
docker ps | grep sonar

# Check logs
docker logs sonar

# Restart
docker restart sonar

# Check memory (need at least 2GB)
free -h
```

### Prometheus targets DOWN

1. Check security groups (ports open)
2. Check service is running
3. Validate config: `promtool check config /etc/prometheus/prometheus.yml`
4. Reload: `curl -X POST http://localhost:9090/-/reload`

### Kubernetes pods not starting

```powershell
# Check pod status
kubectl get pods -n zwiggato

# Check events
kubectl get events -n zwiggato --sort-by='.lastTimestamp'

# Check pod logs
kubectl logs <pod-name> -n zwiggato

# Describe pod
kubectl describe pod <pod-name> -n zwiggato
```

## 📊 Access URLs

### Jenkins Server
- Jenkins: `http://<jenkins-ip>:8080`
- SonarQube: `http://<jenkins-ip>:9000`
- Backend (after deployment): `http://<jenkins-ip>:5000`
- Frontend (after deployment): `http://<jenkins-ip>:3000`

### Monitoring Server
- Prometheus: `http://<monitoring-ip>:9090`
- Grafana: `http://<monitoring-ip>:3000`

### Kubernetes
- ArgoCD: (Get from LoadBalancer service)
- Frontend: (Get from LoadBalancer service)

## 🔐 Default Credentials

- **Jenkins**: (Set during initial setup)
- **SonarQube**: `admin/admin` (change on first login)
- **Grafana**: `admin/admin` (change or skip)
- **ArgoCD**: `admin/<generated-password>`

## 📚 Documentation

For detailed step-by-step instructions, see:
- **ZWIGGATO_DEVOPS_STEP_BY_STEP.md** - Complete guide
- **DEVOPS_IMPLEMENTATION_GUIDE.md** - Reference guide

## ⚡ Quick Tips

1. **Always check security groups** - Most connection issues are firewall related
2. **Wait for services to be ready** - SonarQube takes 2-3 minutes, ArgoCD LoadBalancer takes 5-10 minutes
3. **Use `-w` flag** with kubectl to watch resources in real-time
4. **Check logs first** - Most errors are visible in logs
5. **Validate configs** - Use promtool for Prometheus, check YAML syntax for Kubernetes

## 🆘 Need Help?

1. Check the detailed guide: `ZWIGGATO_DEVOPS_STEP_BY_STEP.md`
2. Check service logs
3. Verify security groups
4. Check service status with systemctl/docker ps/kubectl

