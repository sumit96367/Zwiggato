# DevOps Implementation Guide for Zwiggato Project

This guide provides step-by-step instructions to implement a complete DevOps CI/CD pipeline for the Zwiggato food delivery platform using Jenkins, Docker, SonarQube, Trivy, Prometheus, Grafana, and Kubernetes (EKS).

## 📋 Table of Contents

1. [Infrastructure Setup](#infrastructure-setup)
2. [Jenkins Configuration](#jenkins-configuration)
3. [Docker Setup](#docker-setup)
4. [Security Scanning Tools](#security-scanning-tools)
5. [Code Quality (SonarQube)](#code-quality-sonarqube)
6. [CI/CD Pipeline](#cicd-pipeline)
7. [Monitoring Setup](#monitoring-setup)
8. [Kubernetes Deployment (EKS)](#kubernetes-deployment-eks)
9. [ArgoCD Setup](#argocd-setup)

---

## 🏗️ Infrastructure Setup

### Step 1: Launch EC2 Instance

1. Launch an Ubuntu 24.04 instance (t2.large, 30 GB)
2. Configure Security Groups:
   - Port 8080 for Jenkins
   - Port 9090 for Prometheus
   - Port 3000 for Grafana
   - Port 9000 for SonarQube
   - Port 9100 for Node Exporter
   - Port 22 for SSH

### Step 2: Connect and Update Instance

```bash
# Switch to root user
sudo su

# Update packages
sudo apt update -y
```

### Step 3: Install AWS CLI

```bash
sudo apt install unzip -y
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

---

## 🔧 Jenkins Configuration

### Step 4: Install Jenkins

```bash
# Install Java 17
wget -O - https://packages.adoptium.net/artifactory/api/gpg/key/public | sudo tee /etc/apt/keyrings/adoptium.asc
echo "deb [signed-by=/etc/apt/keyrings/adoptium.asc] https://packages.adoptium.net/artifactory/deb $(awk -F= '/^VERSION_CODENAME/{print$2}' /etc/os-release) main" | sudo tee /etc/apt/sources.list.d/adoptium.list
sudo apt update -y
sudo apt install temurin-17-jdk -y
/usr/bin/java --version

# Install Jenkins
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo tee /usr/share/keyrings/jenkins-keyring.asc > /dev/null
echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] https://pkg.jenkins.io/debian-stable binary/ | sudo tee /etc/apt/sources.list.d/jenkins.list > /dev/null
sudo apt-get update -y
sudo apt-get install jenkins -y
sudo systemctl start jenkins
sudo systemctl status jenkins

# Verify installation
jenkins --version
```

### Step 4.1: Access Jenkins

1. Open port 8080 in security group
2. Access: `http://<your-ec2-ip>:8080`
3. Get initial admin password: `sudo cat /var/lib/jenkins/secrets/initialAdminPassword`
4. Follow setup wizard and install suggested plugins

---

## 🐳 Docker Setup

### Step 5: Install Docker

```bash
# Add Docker's official GPG key
sudo apt-get update
sudo apt-get install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin -y

# Configure permissions
sudo usermod -aG docker ubuntu
sudo usermod -aG docker jenkins
sudo chmod 777 /var/run/docker.sock
newgrp docker

# Verify installation
docker --version
sudo systemctl status docker
```

---

## 🔒 Security Scanning Tools

### Step 6: Install Trivy

```bash
sudo apt-get install wget apt-transport-https gnupg
wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | gpg --dearmor | sudo tee /usr/share/keyrings/trivy.gpg > /dev/null
echo "deb [signed-by=/usr/share/keyrings/trivy.gpg] https://aquasecurity.github.io/trivy-repo/deb generic main" | sudo tee -a /etc/apt/sources.list.d/trivy.list
sudo apt-get update
sudo apt-get install trivy

# Verify installation
trivy --version
```

### Step 7: Install Docker Scout

1. Login to DockerHub account in browser
2. Follow Docker Scout setup from DockerHub dashboard
3. Enable Docker Scout for your repositories

---

## 📊 Code Quality (SonarQube)

### Step 8: Install SonarQube

```bash
docker run -d --name sonar -p 9000:9000 sonarqube:lts-community
docker ps

# Wait for SonarQube to be ready (check logs)
docker logs sonar
```

**Access SonarQube:**
- URL: `http://<your-ec2-ip>:9000`
- Default credentials: `admin/admin` (you'll be prompted to change)

### Step 9: Jenkins Plugins Installation

Install the following plugins in Jenkins (Manage Jenkins → Plugins):

1. **SonarQube Scanner**
2. **OWASP Dependency-Check**
3. **Email Extension Plugin**
4. **Docker Pipeline Plugin**
5. **Prometheus Metrics Plugin**
6. **NodeJS Plugin**

### Step 10: Configure SonarQube in Jenkins

#### 10.1: Tools Configuration

1. Go to **Manage Jenkins → Tools**
2. Configure:
   - **JDK**: JDK 17 (add if not present)
   - **NodeJS**: Node 18 or 20 (add if not present)
   - **SonarQube Scanner**: Install automatically

#### 10.2: SonarQube Server Configuration

1. In SonarQube, go to **Administration → Security → Users**
2. Generate a new token (type: Global Analysis Token)
3. Copy the token

4. In Jenkins:
   - Go to **Manage Jenkins → Credentials**
   - Add new credential:
     - Type: Secret text
     - Secret: (paste SonarQube token)
     - ID: `Sonar-token`
     - Description: SonarQube Token

5. Go to **Manage Jenkins → System**
   - Scroll to **SonarQube servers**
   - Add SonarQube:
     - Name: `sonar-server`
     - Server URL: `http://localhost:9000` (or your server IP:9000)
     - Server authentication token: Select `Sonar-token`

#### 10.3: DockerHub Credentials

1. Go to **Manage Jenkins → Credentials**
2. Add new credential:
   - Type: Username with password
   - Username: Your DockerHub username
   - Password: Your DockerHub password/token
   - ID: `docker`
     - Description: DockerHub Credentials

#### 10.4: Email Configuration

1. Go to **Manage Jenkins → System**
2. Scroll to **Extended E-mail Notification**
3. Configure:
   - SMTP server: `smtp.gmail.com`
   - SMTP Port: `587`
   - Use SSL: Checked
   - Use TLS: Checked
   - User Name: Your email
   - Password: App password (Google App Password)
   - Default user e-mail suffix: Your domain

4. Under **E-mail Notification**:
   - SMTP server: `smtp.gmail.com`
   - Default user e-mail suffix: Your domain
   - Send test e-mail: Test configuration

### Step 11: System Configuration

1. **Manage Jenkins → System → Global properties**
   - Add environment variable: `DOCKER_HOST=unix:///var/run/docker.sock`

2. **Configure Jenkins URL:**
   - Manage Jenkins → System
   - Jenkins URL: `http://<your-ec2-ip>:8080`

### Step 12: Create SonarQube Webhook

1. In SonarQube: **Administration → Configuration → Webhooks**
2. Create webhook:
   - Name: `Jenkins`
   - URL: `http://<jenkins-ip>:8080/sonarqube-webhook/`
   - Secret: (leave empty or generate)

---

## 🔄 CI/CD Pipeline

### Step 13: Create Jenkins Pipeline Job

1. Create new **Pipeline** job in Jenkins
2. Name: `zwiggato-pipeline`
3. Go to **Pipeline** section
4. Select **Pipeline script from SCM**
5. Configure:
   - SCM: Git
   - Repository URL: Your Zwiggato repository URL
   - Credentials: (if private repo)
   - Branch: `*/main` or `*/master`
   - Script Path: `Jenkinsfile`

5. Save

**Note:** The Jenkinsfile is already created in this repository. Make sure to:
- Update DockerHub username in the Jenkinsfile
- Update email address in the Jenkinsfile
- Update SonarQube project key and name

---

## 📈 Monitoring Setup

### Step 14: Launch Monitoring Server

1. Launch new EC2 instance:
   - Name: `Monitoring Server`
   - Ubuntu 24.04
   - t2.large
   - 30 GB EBS
   - Same security group or create new one

### Step 15: Install Prometheus

```bash
# Create Prometheus user
sudo useradd --system --no-create-home --shell /bin/false prometheus

# Download and install Prometheus
wget https://github.com/prometheus/prometheus/releases/download/v2.47.1/prometheus-2.47.1.linux-amd64.tar.gz
tar -xvf prometheus-2.47.1.linux-amd64.tar.gz
cd prometheus-2.47.1.linux-amd64/

# Move files
sudo mkdir -p /data /etc/prometheus
sudo mv prometheus promtool /usr/local/bin/
sudo mv consoles/ console_libraries/ /etc/prometheus/
sudo mv prometheus.yml /etc/prometheus/prometheus.yml

# Set ownership
sudo chown -R prometheus:prometheus /etc/prometheus/ /data/

# Create systemd service
sudo vi /etc/systemd/system/prometheus.service
```

Add this content to `/etc/systemd/system/prometheus.service`:

```ini
[Unit]
Description=Prometheus
Wants=network-online.target
After=network-online.target
StartLimitIntervalSec=500
StartLimitBurst=5

[Service]
User=prometheus
Group=prometheus
Type=simple
Restart=on-failure
RestartSec=5s
ExecStart=/usr/local/bin/prometheus \
  --config.file=/etc/prometheus/prometheus.yml \
  --storage.tsdb.path=/data \
  --web.console.templates=/etc/prometheus/consoles \
  --web.console.libraries=/etc/prometheus/console_libraries \
  --web.listen-address=0.0.0.0:9090 \
  --web.enable-lifecycle

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start Prometheus
sudo systemctl enable prometheus
sudo systemctl start prometheus
sudo systemctl status prometheus

# Access Prometheus: http://<monitoring-server-ip>:9090
```

### Step 16: Install Node Exporter

```bash
# Create user
sudo useradd --system --no-create-home --shell /bin/false node_exporter

# Download and install
cd ~
wget https://github.com/prometheus/node_exporter/releases/download/v1.6.1/node_exporter-1.6.1.linux-amd64.tar.gz
tar -xvf node_exporter-1.6.1.linux-amd64.tar.gz
sudo mv node_exporter-1.6.1.linux-amd64/node_exporter /usr/local/bin/
rm -rf node_exporter*

# Create systemd service
sudo vi /etc/systemd/system/node_exporter.service
```

Add this content:

```ini
[Unit]
Description=Node Exporter
Wants=network-online.target
After=network-online.target
StartLimitIntervalSec=500
StartLimitBurst=5

[Service]
User=node_exporter
Group=node_exporter
Type=simple
Restart=on-failure
RestartSec=5s
ExecStart=/usr/local/bin/node_exporter --collector.logind

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start
sudo systemctl enable node_exporter
sudo systemctl start node_exporter
sudo systemctl status node_exporter
```

### Step 17: Configure Prometheus Integration

Edit Prometheus configuration:

```bash
sudo vi /etc/prometheus/prometheus.yml
```

Add these jobs at the end:

```yaml
  - job_name: 'node_exporter'
    static_configs:
      - targets: ['<monitoring-vm-ip>:9100']

  - job_name: 'jenkins'
    metrics_path: '/prometheus'
    static_configs:
      - targets: ['<jenkins-ip>:8080']
```

Validate and reload:

```bash
promtool check config /etc/prometheus/prometheus.yml
curl -X POST http://localhost:9090/-/reload
```

**Verify:** Access `http://<prometheus-ip>:9090/targets` - should see all targets UP

### Step 18: Install Grafana

```bash
# Install dependencies
sudo apt-get update
sudo apt-get install -y apt-transport-https software-properties-common

# Add GPG key
cd ~
wget -q -O - https://packages.grafana.com/gpg.key | sudo apt-key add -

# Add repository
echo "deb https://packages.grafana.com/oss/deb stable main" | sudo tee -a /etc/apt/sources.list.d/grafana.list

# Install Grafana
sudo apt-get update
sudo apt-get -y install grafana

# Enable and start
sudo systemctl enable grafana-server
sudo systemctl start grafana-server
sudo systemctl status grafana-server

# Access Grafana: http://<monitoring-server-ip>:3000
# Default credentials: admin/admin
```

**Add Prometheus Data Source:**
1. Login to Grafana
2. Go to **Configuration → Data Sources → Add data source**
3. Select **Prometheus**
4. URL: `http://localhost:9090`
5. Save & Test

**Import Dashboards:**
1. Go to **Dashboards → Import**
2. Import dashboard IDs:
   - Node Exporter: `1860`
   - Jenkins: `9964`

---

## ☸️ Kubernetes Deployment (EKS)

### Step 19: Install Required Tools (on local machine)

**Prerequisites:**
- AWS CLI configured
- kubectl installed
- eksctl installed
- Helm installed

**Install kubectl:**
```bash
# Windows (PowerShell as Administrator)
curl -LO "https://dl.k8s.io/release/v1.28.0/bin/windows/amd64/kubectl.exe"
# Add to PATH
```

**Install eksctl:**
```bash
# Windows
choco install eksctl
# Or download from: https://github.com/weaveworks/eksctl/releases
```

**Install Helm:**
```bash
# Windows
choco install kubernetes-helm
```

### Step 20: Create EKS Cluster

**Important:** Use single line commands in PowerShell or use backticks (`) for line continuation.

```powershell
# Create EKS Cluster (single line)
eksctl create cluster --name=zwiggato-cluster --region=ap-northeast-1 --zones=ap-northeast-1a,ap-northeast-1c --without-nodegroup
```

**Wait 20-25 minutes** for cluster creation. Verify in AWS Console → CloudFormation.

### Step 21: Create OIDC Provider

```powershell
eksctl utils associate-iam-oidc-provider --region ap-northeast-1 --cluster zwiggato-cluster --approve
```

### Step 22: Create Node Group

```powershell
eksctl create nodegroup --cluster=zwiggato-cluster --region=ap-northeast-1 --name=zwiggato-ng-public1 --node-type=t3.medium --nodes=2 --nodes-min=2 --nodes-max=4 --node-volume-size=20 --ssh-access --ssh-public-key=your-key-name --managed --asg-access --external-dns-access --full-ecr-access --appmesh-access --alb-ingress-access
```

**Note:** Replace `your-key-name` with your actual EC2 key pair name.

### Step 23: Configure kubectl

```powershell
aws eks update-kubeconfig --region ap-northeast-1 --name zwiggato-cluster
kubectl get nodes
```

### Step 24: Deploy Zwiggato to EKS

1. **Update Kubernetes manifests:**
   - Update image names in `k8s/backend-deployment.yaml`
   - Update image names in `k8s/frontend-deployment.yaml`
   - Replace `<dockerhub-username>` with your DockerHub username

2. **Deploy to cluster:**
   ```bash
   kubectl apply -f k8s/namespace.yaml
   kubectl apply -f k8s/configmap.yaml
   kubectl apply -f k8s/secrets.yaml
   kubectl apply -f k8s/mongodb-pvc.yaml
   kubectl apply -f k8s/mongodb-deployment.yaml
   kubectl apply -f k8s/backend-deployment.yaml
   kubectl apply -f k8s/frontend-deployment.yaml
   ```

3. **Verify deployment:**
   ```bash
   kubectl get pods -n zwiggato
   kubectl get svc -n zwiggato
   ```

---

## 🚀 ArgoCD Setup

### Step 25: Install ArgoCD

```powershell
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/v2.4.7/manifests/install.yaml

# Wait for pods to be ready
kubectl get pods -n argocd -w

# Expose ArgoCD server
kubectl patch svc argocd-server -n argocd -p '{"spec": {"type": "LoadBalancer"}}'

# Wait for LoadBalancer (5 minutes)
kubectl get svc argocd-server -n argocd
```

### Step 26: Access ArgoCD

**Get LoadBalancer URL:**
```powershell
# PowerShell
$env:ARGOCD_SERVER = $(kubectl get svc argocd-server -n argocd -o json | jq --raw-output '.status.loadBalancer.ingress[0].hostname')
echo $env:ARGOCD_SERVER

# Get password
$env:ARGO_PWD = (kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | % { [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($_)) })
echo $env:ARGO_PWD
```

**Login:**
- URL: Use the LoadBalancer URL from above
- Username: `admin`
- Password: Use the password from above

### Step 27: Monitor Kubernetes with Prometheus

**Install Node Exporter in Kubernetes:**
```powershell
# Add Helm repo
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts

# Create namespace
kubectl create namespace prometheus-node-exporter

# Install Node Exporter
helm install prometheus-node-exporter prometheus-community/prometheus-node-exporter --namespace prometheus-node-exporter
```

**Update Prometheus Configuration:**

1. Get node IP from EKS cluster
2. Edit Prometheus config:
   ```bash
   sudo vi /etc/prometheus/prometheus.yml
   ```
3. Add job:
   ```yaml
   - job_name: 'k8s'
     metrics_path: '/metrics'
     static_configs:
       - targets: ['<node-ip>:9100']
   ```
4. Reload:
   ```bash
   promtool check config /etc/prometheus/prometheus.yml
   curl -X POST http://localhost:9090/-/reload
   ```

**Open ports:**
- Port 9100 for EKS nodes
- Port 30001 if using NodePort service

---

## ✅ Verification Checklist

- [ ] Jenkins is accessible and configured
- [ ] Docker is installed and working
- [ ] Trivy is installed
- [ ] SonarQube is running and accessible
- [ ] Jenkins plugins are installed
- [ ] Credentials are configured (SonarQube token, DockerHub)
- [ ] Email notification is configured
- [ ] Jenkins pipeline runs successfully
- [ ] Docker images are built and pushed to DockerHub
- [ ] Prometheus is running and scraping metrics
- [ ] Node Exporter is running
- [ ] Grafana is configured with Prometheus data source
- [ ] EKS cluster is created
- [ ] Node group is created
- [ ] Application is deployed to EKS
- [ ] ArgoCD is installed and accessible
- [ ] Kubernetes monitoring is configured

---

## 🔧 Troubleshooting

### Jenkins Issues

**Docker permission denied:**
```bash
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

**Pipeline fails at Docker build:**
- Check if Docker daemon is running: `sudo systemctl status docker`
- Check Docker socket permissions: `sudo chmod 777 /var/run/docker.sock`

### SonarQube Issues

**SonarQube not accessible:**
- Check container status: `docker ps`
- Check logs: `docker logs sonar`
- Increase memory: Docker needs at least 2GB RAM

### Prometheus Issues

**Targets showing as DOWN:**
- Check firewall rules
- Verify port numbers
- Check Prometheus config: `promtool check config /etc/prometheus/prometheus.yml`

### EKS Issues

**Cluster creation fails:**
- Check IAM permissions
- Verify AWS CLI configuration
- Check CloudFormation stack for errors

**kubectl connection issues:**
- Re-run: `aws eks update-kubeconfig --region <region> --name <cluster-name>`
- Check AWS credentials: `aws sts get-caller-identity`

---

## 📚 Additional Resources

- [Jenkins Documentation](https://www.jenkins.io/doc/)
- [Docker Documentation](https://docs.docker.com/)
- [SonarQube Documentation](https://docs.sonarqube.org/)
- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [EKS Documentation](https://docs.aws.amazon.com/eks/)
- [ArgoCD Documentation](https://argo-cd.readthedocs.io/)

---

## 📝 Notes

1. **Security:** Always use secrets management for sensitive data (credentials, tokens)
2. **Cost:** Monitor AWS costs, especially for EKS cluster
3. **Backup:** Regular backups of Prometheus data, SonarQube database
4. **Updates:** Keep tools updated for security patches
5. **Monitoring:** Set up alerts in Grafana for critical metrics

---

**Last Updated:** 2024
**Project:** Zwiggato Food Delivery Platform

