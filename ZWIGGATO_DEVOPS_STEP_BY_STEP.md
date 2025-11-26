# Zwiggato DevOps Implementation - Complete Step-by-Step Guide

**Based on Dr. Kastro Kiran's DevOps Project Template**
**Adapted for Zwiggato Food Delivery Platform**

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Infrastructure Setup](#infrastructure-setup)
3. [Jenkins Installation & Configuration](#jenkins-installation--configuration)
4. [Docker Setup](#docker-setup)
5. [Security Scanning Tools](#security-scanning-tools)
6. [SonarQube Configuration](#sonarqube-configuration)
7. [Jenkins Pipeline Configuration](#jenkins-pipeline-configuration)
8. [Monitoring Setup (Prometheus, Grafana)](#monitoring-setup)
9. [EKS Cluster Creation](#eks-cluster-creation)
10. [ArgoCD Installation](#argocd-installation)
11. [Kubernetes Monitoring](#kubernetes-monitoring)
12. [Verification Checklist](#verification-checklist)

---

## 🔧 Prerequisites

Before starting, ensure you have:
- AWS Account with appropriate permissions
- DockerHub account
- Email account for notifications (Gmail recommended)
- VS Code or PowerShell with AWS CLI configured
- Basic knowledge of Linux commands

---

## 🏗️ Infrastructure Setup

### Step 1: Launch EC2 Instance for Jenkins Server

1. **Login to AWS Console**
2. **Go to EC2 Dashboard**
3. **Launch Instance with these specifications:**
   - **Name**: `Jenkins Server` or `Zwiggato-Jenkins`
   - **AMI**: Ubuntu Server 24.04 LTS
   - **Instance Type**: t2.large (minimum recommended)
   - **Key Pair**: Select or create a key pair
   - **Network Settings**: 
     - Create new security group or select existing
     - **Inbound Rules** (add these ports):
       - Port 22 (SSH) - Source: My IP
       - Port 8080 (Jenkins) - Source: 0.0.0.0/0 (or your IP)
       - Port 9000 (SonarQube) - Source: 0.0.0.0/0
       - Port 5000 (Backend) - Source: 0.0.0.0/0
       - Port 3000 (Frontend/Grafana) - Source: 0.0.0.0/0
   - **Storage**: 30 GB (gp3)
4. **Launch Instance**

### Step 2: Connect to Instance

**Using SSH (Linux/Mac):**
```bash
ssh -i your-key.pem ubuntu@<your-instance-ip>
```

**Using PuTTY (Windows):**
1. Convert .pem to .ppk using PuTTYgen
2. Connect using PuTTY with the .ppk file

### Step 3: Update System Packages

```bash
# Switch to root user
sudo su

# Update packages
sudo apt update -y
sudo apt upgrade -y
```

### Step 4: Install AWS CLI

```bash
# Install unzip
sudo apt install unzip -y

# Download AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"

# Unzip
unzip awscliv2.zip

# Install
sudo ./aws/install

# Verify installation
aws --version
```

---

## 🔧 Jenkins Installation & Configuration

### Step 5: Install Jenkins on Ubuntu

**Reference:** https://www.jenkins.io/doc/book/installing/linux/#debianubuntu

```bash
#!/bin/bash
# Run all commands as root (sudo su)

# Update packages
sudo apt update -y

# Install Java 17 (Temurin)
wget -O - https://packages.adoptium.net/artifactory/api/gpg/key/public | sudo tee /etc/apt/keyrings/adoptium.asc

echo "deb [signed-by=/etc/apt/keyrings/adoptium.asc] https://packages.adoptium.net/artifactory/deb $(awk -F= '/^VERSION_CODENAME/{print$2}' /etc/os-release) main" | sudo tee /etc/apt/sources.list.d/adoptium.list

sudo apt update -y

sudo apt install temurin-17-jdk -y

# Verify Java installation
/usr/bin/java --version

# Install Jenkins
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo tee /usr/share/keyrings/jenkins-keyring.asc > /dev/null

echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] https://pkg.jenkins.io/debian-stable binary/ | sudo tee /etc/apt/sources.list.d/jenkins.list > /dev/null

sudo apt-get update -y

sudo apt-get install jenkins -y

# Start Jenkins
sudo systemctl start jenkins

# Enable Jenkins on boot
sudo systemctl enable jenkins

# Check status
sudo systemctl status jenkins

# Verify Jenkins installation
jenkins --version
```

**Press `Ctrl+C` to exit status view**

### Step 5.1: Access Jenkins Web Interface

1. **Open Port 8080 in Security Group:**
   - Go to EC2 → Security Groups
   - Select your security group
   - Add Inbound Rule: Port 8080, Source: 0.0.0.0/0 (or your IP)

2. **Access Jenkins:**
   - Open browser: `http://<your-ec2-ip>:8080`

3. **Get Initial Admin Password:**
   ```bash
   sudo cat /var/lib/jenkins/secrets/initialAdminPassword
   ```
   - Copy the password from terminal
   - Paste in Jenkins unlock screen

4. **Jenkins Setup Wizard:**
   - Click "Install suggested plugins"
   - Wait for installation to complete
   - Create first admin user (save credentials!)
   - Click "Save and Finish"
   - Click "Start using Jenkins"

---

## 🐳 Docker Setup

### Step 6: Install Docker on Ubuntu

**Reference:** https://docs.docker.com/engine/install/ubuntu/

```bash
# Update packages
sudo apt-get update

# Install prerequisites
sudo apt-get install ca-certificates curl

# Create directory for keyrings
sudo install -m 0755 -d /etc/apt/keyrings

# Add Docker's official GPG key
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc

sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Update packages again
sudo apt-get update

# Install Docker
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin -y

# Add ubuntu user to docker group
sudo usermod -aG docker ubuntu

# Add jenkins user to docker group (IMPORTANT!)
sudo usermod -aG docker jenkins

# Fix Docker socket permissions
sudo chmod 777 /var/run/docker.sock

# Reload group membership
newgrp docker

# Verify Docker installation
docker --version

# Check Docker status
sudo systemctl status docker

# Test Docker
docker run hello-world
```

**Press `Ctrl+C` to exit status view**

**Important:** Restart Jenkins after adding user to docker group:
```bash
sudo systemctl restart jenkins
```

---

## 🔒 Security Scanning Tools

### Step 7: Install Trivy on Ubuntu

**Reference:** https://aquasecurity.github.io/trivy/v0.55/getting-started/installation/

```bash
# Install prerequisites
sudo apt-get install wget apt-transport-https gnupg

# Add Trivy GPG key
wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | gpg --dearmor | sudo tee /usr/share/keyrings/trivy.gpg > /dev/null

# Add Trivy repository
echo "deb [signed-by=/usr/share/keyrings/trivy.gpg] https://aquasecurity.github.io/trivy-repo/deb generic main" | sudo tee -a /etc/apt/sources.list.d/trivy.list

# Update packages
sudo apt-get update

# Install Trivy
sudo apt-get install trivy

# Verify Trivy installation
trivy --version
```

### Step 8: Install Docker Scout

1. **Login to DockerHub in Browser:**
   - Go to https://hub.docker.com
   - Login to your account

2. **Enable Docker Scout:**
   - Go to DockerHub Dashboard
   - Navigate to "Scout" section
   - Enable Docker Scout for your repositories
   - Follow the setup wizard

**Note:** Docker Scout will be used in the Jenkins pipeline to scan images.

---

## 📊 SonarQube Configuration

### Step 9: Install SonarQube using Docker

```bash
# Run SonarQube container
docker run -d --name sonar -p 9000:9000 sonarqube:lts-community

# Check container status
docker ps

# View logs (wait for SonarQube to be ready)
docker logs sonar -f
```

**Wait for message:** `SonarQube is operational`

**Press `Ctrl+C` to exit logs**

**Access SonarQube:**
- URL: `http://<your-ec2-ip>:9000`
- Default credentials: `admin/admin`
- You'll be prompted to change password (remember it!)

### Step 10: Install Required Jenkins Plugins

1. **In Jenkins Web UI:**
   - Go to **Manage Jenkins** → **Plugins**
   - Click **Available plugins** tab

2. **Install these plugins (search and install one by one):**
   - ✅ **SonarQube Scanner**
   - ✅ **OWASP Dependency-Check**
   - ✅ **Email Extension Plugin**
   - ✅ **Docker Pipeline Plugin**
   - ✅ **Prometheus Metrics Plugin**
   - ✅ **NodeJS Plugin**

3. **After installing:**
   - Check "Restart Jenkins when installation is complete"
   - Wait for Jenkins to restart

### Step 11: SonarQube Configuration in Jenkins

#### Step 11.1: Tools Configuration in Jenkins

1. **Go to Manage Jenkins → Tools**
2. **Configure the following:**

   **JDK:**
   - Click "JDK installations" → "Add JDK"
   - Name: `jdk17`
   - JAVA_HOME: `/usr/lib/jvm/temurin-17-jdk-amd64`
   - Check "Install automatically" if path doesn't work
   - Click "Save"

   **NodeJS:**
   - Click "NodeJS installations" → "Add NodeJS"
   - Name: `node23` (or `node18`)
   - Version: Select latest LTS (or 18.x/20.x)
   - Check "Install automatically"
   - Click "Save"

   **SonarQube Scanner:**
   - Click "SonarQube Scanner installations" → "Add SonarQube Scanner"
   - Name: `sonar-scanner`
   - Check "Install automatically"
   - Click "Save"

#### Step 11.2: Configure SonarQube Token in Jenkins

**First, create token in SonarQube:**
1. In SonarQube UI: `http://<your-ec2-ip>:9000`
2. Login as admin
3. Go to **Administration** → **Security** → **Users**
4. Click on **Tokens** tab
5. Generate new token:
   - Name: `Jenkins-Token`
   - Type: **Global Analysis Token**
   - Expires in: 365 days (or No expiration)
6. **Copy the token** (you won't see it again!)

**Now configure in Jenkins:**
1. In Jenkins: **Manage Jenkins** → **Credentials** → **System** → **Global credentials**
2. Click **Add Credentials**:
   - Kind: **Secret text**
   - Secret: (paste the SonarQube token)
   - ID: `Sonar-token`
   - Description: `SonarQube Token for Jenkins`
   - Click **OK**

3. **Configure SonarQube Server:**
   - Go to **Manage Jenkins** → **System**
   - Scroll to **SonarQube servers** section
   - Click **Add SonarQube**:
     - Name: `sonar-server`
     - Server URL: `http://localhost:9000` (or `http://<your-ec2-ip>:9000`)
     - Server authentication token: Select `Sonar-token` from dropdown
   - Click **Save**

#### Step 11.3: DockerHub Credentials Configuration

1. **In Jenkins:**
   - Go to **Manage Jenkins** → **Credentials** → **System** → **Global credentials**
   - Click **Add Credentials**:
     - Kind: **Username with password**
     - Username: `your-dockerhub-username`
     - Password: `your-dockerhub-password` (or access token)
     - ID: `docker`
     - Description: `DockerHub Credentials`
     - Click **OK**

**Note:** You can generate a DockerHub access token at: https://hub.docker.com/settings/security

#### Step 11.4: Email Notification Configuration

**For Gmail:**
1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password:**
   - Go to Google Account Settings
   - Security → 2-Step Verification → App passwords
   - Generate app password for "Mail"
   - Copy the 16-character password

3. **Configure in Jenkins:**
   - Go to **Manage Jenkins** → **System**
   - Scroll to **Extended E-mail Notification**:
     - SMTP server: `smtp.gmail.com`
     - SMTP Port: `587`
     - ✅ Use SSL
     - ✅ Use TLS
     - User Name: `your-email@gmail.com`
     - Password: (paste the 16-character app password)
     - Default user e-mail suffix: `@gmail.com`
     - Default subject: `'${currentBuild.result}': Build ${env.BUILD_NUMBER} - ${env.JOB_NAME}`
     - Default body: (use default or customize)

   - Scroll to **E-mail Notification**:
     - SMTP server: `smtp.gmail.com`
     - Default user e-mail suffix: `@gmail.com`
     - ✅ Use SSL
     - Click **Advanced**:
       - SMTP Port: `587`
       - Credentials: (leave empty or add)
     - **Send test e-mail** to verify

4. **Click Save**

### Step 12: System Configuration in Jenkins

1. **Configure Jenkins URL:**
   - Go to **Manage Jenkins** → **System**
   - Scroll to **Jenkins Location**:
     - Jenkins URL: `http://<your-ec2-ip>:8080`
   - Click **Save**

2. **Add Environment Variable:**
   - In **Manage Jenkins** → **System**
   - Scroll to **Global properties**
   - Check **Environment variables**
   - Add:
     - Key: `DOCKER_HOST`
     - Value: `unix:///var/run/docker.sock`
   - Click **Save**

### Step 13: Create SonarQube Webhook

1. **In SonarQube UI:** `http://<your-ec2-ip>:9000`
2. Go to **Administration** → **Configuration** → **Webhooks**
3. Click **Create**
   - Name: `Jenkins`
   - URL: `http://<your-jenkins-ip>:8080/sonarqube-webhook/`
   - Secret: (leave empty)
4. Click **Create**

---

## 🔄 Jenkins Pipeline Configuration

### Step 14: Create Pipeline Job

1. **In Jenkins:**
   - Click **New Item**
   - Name: `zwiggato-pipeline`
   - Select **Pipeline**
   - Click **OK**

2. **Configure Pipeline:**
   - **Description:** `CI/CD Pipeline for Zwiggato Food Delivery Platform`

   - Scroll to **Pipeline** section:
     - Definition: **Pipeline script from SCM**
     - SCM: **Git**
     - Repository URL: `https://github.com/YOUR_USERNAME/YOUR_REPO.git`
       - **Replace with your actual GitHub repository URL**
     - Credentials: (add if repository is private)
     - Branch: `*/main` (or `*/master`)
     - Script Path: `Jenkinsfile`

3. **Click Save**

**Before running the pipeline, make sure to:**

1. **Update Jenkinsfile:**
   - Update DockerHub username (replace `your-dockerhub-username`)
   - Update email address in post actions
   - Verify repository URL matches your GitHub repo

2. **Push Jenkinsfile to your repository** (if not already there)

### Step 14.1: Alternative - Use Pipeline Script Directly

If you prefer to use the pipeline script directly in Jenkins:

1. **In Pipeline configuration:**
   - Definition: **Pipeline script**
   - Paste the Jenkinsfile content directly

2. **Make sure to update:**
   - DockerHub username
   - Email address
   - Repository URL if using Git checkout

---

## 📈 Monitoring Setup

### Step 15: Launch Monitoring Server EC2 Instance

1. **In AWS Console:**
   - Go to EC2 → Launch Instance
   - **Name**: `Monitoring Server` or `Zwiggato-Monitoring`
   - **AMI**: Ubuntu Server 24.04 LTS
   - **Instance Type**: t2.large
   - **Key Pair**: Same as Jenkins server
   - **Security Group**: Create new or select existing
     - **Inbound Rules:**
       - Port 9090 (Prometheus)
       - Port 3000 (Grafana)
       - Port 9100 (Node Exporter)
       - Port 22 (SSH)
   - **Storage**: 30 GB
   - **Launch Instance**

### Step 15.1: Connect to Monitoring Server

```bash
ssh -i your-key.pem ubuntu@<monitoring-server-ip>
```

---

### Step 15.2: Installing Prometheus

```bash
# Switch to root (if needed)
sudo su

# Create Prometheus user
sudo useradd --system --no-create-home --shell /bin/false prometheus

# Download Prometheus
wget https://github.com/prometheus/prometheus/releases/download/v2.47.1/prometheus-2.47.1.linux-amd64.tar.gz

# Extract files
tar -xvf prometheus-2.47.1.linux-amd64.tar.gz

cd prometheus-2.47.1.linux-amd64/

# Create directories
sudo mkdir -p /data /etc/prometheus

# Move binaries
sudo mv prometheus promtool /usr/local/bin/

# Move configuration files
sudo mv consoles/ console_libraries/ /etc/prometheus/

# Move config file
sudo mv prometheus.yml /etc/prometheus/prometheus.yml

# Set ownership
sudo chown -R prometheus:prometheus /etc/prometheus/ /data/

# Create systemd service file
sudo vi /etc/systemd/system/prometheus.service
```

**Add this content to the file:**

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

**Save and exit:** Press `Esc`, then type `:wq` and press `Enter`

```bash
# Enable and start Prometheus
sudo systemctl enable prometheus
sudo systemctl start prometheus

# Check status
sudo systemctl status prometheus
```

**Press `Ctrl+C` to exit**

**Verify Prometheus:**
- Open browser: `http://<monitoring-server-ip>:9090`
- You should see Prometheus web UI
- Go to **Status** → **Targets**
- Should see `Prometheus (1/1 up)`

---

### Step 15.3: Installing Node Exporter

```bash
# Go to home directory
cd ~

# Create Node Exporter user
sudo useradd --system --no-create-home --shell /bin/false node_exporter

# Download Node Exporter
wget https://github.com/prometheus/node_exporter/releases/download/v1.6.1/node_exporter-1.6.1.linux-amd64.tar.gz

# Extract
tar -xvf node_exporter-1.6.1.linux-amd64.tar.gz

# Move binary
sudo mv node_exporter-1.6.1.linux-amd64/node_exporter /usr/local/bin/

# Clean up
rm -rf node_exporter*

# Create systemd service
sudo vi /etc/systemd/system/node_exporter.service
```

**Add this content:**

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

**Save and exit** (`Esc` → `:wq` → `Enter`)

```bash
# Enable and start Node Exporter
sudo systemctl enable node_exporter
sudo systemctl start node_exporter

# Check status
sudo systemctl status node_exporter
```

**Press `Ctrl+C` to exit**

---

### Step 15.4: Configure Prometheus Integration

**Add Jenkins and Node Exporter as targets:**

```bash
# Edit Prometheus configuration
sudo vi /etc/prometheus/prometheus.yml
```

**Find the `scrape_configs` section and add these jobs at the end:**

```yaml
  - job_name: 'node_exporter'
    static_configs:
      - targets: ['<monitoring-vm-ip>:9100']

  - job_name: 'jenkins'
    metrics_path: '/prometheus'
    static_configs:
      - targets: ['<jenkins-ip>:8080']
```

**Replace:**
- `<monitoring-vm-ip>` with your Monitoring Server IP
- `<jenkins-ip>` with your Jenkins Server IP

**Save and exit** (`Esc` → `:wq` → `Enter`)

```bash
# Validate configuration
promtool check config /etc/prometheus/prometheus.yml

# Should see "SUCCESS"

# Reload Prometheus configuration
curl -X POST http://localhost:9090/-/reload
```

**Verify in Prometheus:**
- Open: `http://<monitoring-server-ip>:9090/targets`
- Should see:
  - ✅ Prometheus (1/1 up)
  - ✅ node_exporter (1/1 up)
  - ✅ jenkins (1/1 up)

**Note:** If Jenkins shows as DOWN:
- Make sure Prometheus Metrics Plugin is installed in Jenkins
- Restart Jenkins: `sudo systemctl restart jenkins`
- Wait 2-3 minutes and reload Prometheus targets page

---

### Step 15.5: Install Grafana

```bash
# Go to home directory
cd ~

# Install dependencies
sudo apt-get update
sudo apt-get install -y apt-transport-https software-properties-common

# Add Grafana GPG key
wget -q -O - https://packages.grafana.com/gpg.key | sudo apt-key add -

# Should see "OK"

# Add Grafana repository
echo "deb https://packages.grafana.com/oss/deb stable main" | sudo tee -a /etc/apt/sources.list.d/grafana.list

# Update and install Grafana
sudo apt-get update
sudo apt-get -y install grafana

# Enable Grafana service
sudo systemctl enable grafana-server

# Start Grafana
sudo systemctl start grafana-server

# Check status
sudo systemctl status grafana-server
```

**Press `Ctrl+C` to exit**

**Access Grafana:**
- URL: `http://<monitoring-server-ip>:3000`
- Default username: `admin`
- Default password: `admin`
- You'll be prompted to change password (or click "Skip")

**Add Prometheus Data Source:**
1. In Grafana: Click **Configuration** (gear icon) → **Data Sources**
2. Click **Add data source**
3. Select **Prometheus**
4. **URL**: `http://localhost:9090`
5. Click **Save & Test** (should see "Data source is working")

**Import Dashboards:**
1. Click **Dashboards** (grid icon) → **Import**
2. Import dashboard IDs:
   - **Node Exporter**: Enter `1860` → Click **Load**
     - Select Prometheus data source
     - Click **Import**
   - **Jenkins**: Enter `9964` → Click **Load**
     - Select Prometheus data source
     - Click **Import**

3. View dashboards in **Dashboards** → **Browse**

---

## ☸️ EKS Cluster Creation

### Step 16: Install Required Tools on Local Machine (VS Code/PowerShell)

**Prerequisites on your local Windows machine:**

1. **AWS CLI** (if not installed):
   ```powershell
   # Download from: https://awscli.amazonaws.com/AWSCLIV2.msi
   # Or use PowerShell:
   winget install Amazon.AWSCLI
   ```

2. **kubectl** (Kubernetes CLI):
   ```powershell
   # Download from: https://kubernetes.io/docs/tasks/tools/install-kubectl-windows/
   # Or use Chocolatey:
   choco install kubernetes-cli
   ```

3. **eksctl** (EKS CLI):
   ```powershell
   # Using Chocolatey:
   choco install eksctl
   
   # Or download from: https://github.com/weaveworks/eksctl/releases
   ```

4. **Helm** (Kubernetes package manager):
   ```powershell
   choco install kubernetes-helm
   ```

5. **jq** (JSON processor - for ArgoCD):
   ```powershell
   choco install jq
   ```

**Verify installations:**
```powershell
aws --version
kubectl version --client
eksctl version
helm version
jq --version
```

**Configure AWS CLI:**
```powershell
aws configure
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key
# Enter default region: ap-northeast-1 (or your preferred region)
# Enter default output format: json
```

---

### Step 17: Create EKS Cluster using eksctl

**Important for PowerShell:** Use single-line commands or backticks (`) for line continuation.

**Open VS Code or PowerShell as Administrator**

```powershell
# Step 17.1: Create EKS Cluster (single line - recommended)
eksctl create cluster --name=zwiggato-cluster --region=ap-northeast-1 --zones=ap-northeast-1a,ap-northeast-1c --without-nodegroup

# This will take 20-25 minutes!
# You can monitor progress in AWS Console → CloudFormation
```

**OR using backticks (if needed):**

```powershell
eksctl create cluster --name=zwiggato-cluster `
                      --region=ap-northeast-1 `
                      --zones=ap-northeast-1a,ap-northeast-1c `
                      --without-nodegroup
```

**Wait for:** `EKS Cluster "zwiggato-cluster" in "ap-northeast-1" region is ready`

**Verify cluster:**
```powershell
eksctl get cluster --region=ap-northeast-1
```

**Also verify in AWS Console:**
- Go to **EKS** → **Clusters**
- Should see `zwiggato-cluster`

---

### Step 18: Create & Associate IAM OIDC Provider

```powershell
# Single line
eksctl utils associate-iam-oidc-provider --region ap-northeast-1 --cluster zwiggato-cluster --approve
```

---

### Step 19: Create Node Group with Add-Ons

**Before running, get your EC2 Key Pair name:**
- Go to AWS Console → EC2 → Key Pairs
- Note the name (e.g., `my-key-pair`)

```powershell
# Single line (replace YOUR_KEY_NAME with your actual key pair name)
eksctl create nodegroup --cluster=zwiggato-cluster --region=ap-northeast-1 --name=zwiggato-ng-public1 --node-type=t3.medium --nodes=2 --nodes-min=2 --nodes-max=4 --node-volume-size=20 --ssh-access --ssh-public-key=YOUR_KEY_NAME --managed --asg-access --external-dns-access --full-ecr-access --appmesh-access --alb-ingress-access
```

**This will take 10-15 minutes**

**Verify node group:**
```powershell
eksctl get nodegroup --cluster=zwiggato-cluster --region=ap-northeast-1
```

---

### Step 20: Configure kubectl

```powershell
# Update kubeconfig
aws eks update-kubeconfig --region ap-northeast-1 --name zwiggato-cluster

# Verify connection
kubectl get nodes

# Should show 2 nodes in Ready state
```

---

### Step 21: Deploy Zwiggato to EKS

**First, update Kubernetes deployment files:**

1. **Update `k8s/backend-deployment.yaml`:**
   - Change `image: zwiggato/backend:latest` to `image: YOUR_DOCKERHUB_USERNAME/zwiggato-backend:latest`
   - Replace `YOUR_DOCKERHUB_USERNAME` with your actual DockerHub username

2. **Update `k8s/frontend-deployment.yaml`:**
   - Change `image: zwiggato/frontend:latest` to `image: YOUR_DOCKERHUB_USERNAME/zwiggato-frontend:latest`

**Then deploy:**

```powershell
# Apply all Kubernetes manifests
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/mongodb-pvc.yaml
kubectl apply -f k8s/mongodb-deployment.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml

# Check deployment status
kubectl get pods -n zwiggato

# Watch pods (wait for all to be Running)
kubectl get pods -n zwiggato -w

# Check services
kubectl get svc -n zwiggato
```

**Get LoadBalancer URL for frontend:**
```powershell
kubectl get svc zwiggato-frontend-service -n zwiggato
```

**Access application:**
- Frontend: Use the EXTERNAL-IP from LoadBalancer service
- Backend: Internal service (ClusterIP)

---

## 🚀 ArgoCD Installation

### Step 22: Install ArgoCD

```powershell
# Create namespace
kubectl create namespace argocd

# Install ArgoCD
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/v2.4.7/manifests/install.yaml

# Wait for pods to be ready (watch status)
kubectl get pods -n argocd -w

# Press Ctrl+C when all pods are Running

# Expose ArgoCD server as LoadBalancer
kubectl patch svc argocd-server -n argocd -p '{"spec": {"type": "LoadBalancer"}}'

# Wait 5 minutes for LoadBalancer creation
kubectl get svc argocd-server -n argocd -w
```

**Get ArgoCD URL:**

**PowerShell:**
```powershell
$env:ARGOCD_SERVER = $(kubectl get svc argocd-server -n argocd -o json | jq --raw-output '.status.loadBalancer.ingress[0].hostname')
echo $env:ARGOCD_SERVER
```

**Or manually:**
```powershell
kubectl get svc argocd-server -n argocd
# Copy the EXTERNAL-IP or hostname
```

**Get ArgoCD Admin Password:**

**PowerShell:**
```powershell
$env:ARGO_PWD = (kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | % { [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($_)) })
echo $env:ARGO_PWD
```

**Or manually:**
```powershell
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d
```

**Access ArgoCD:**
- URL: Use the LoadBalancer URL from above (or IP)
- Username: `admin`
- Password: Use the password from above
- Login and change password if prompted

---

## 📊 Kubernetes Monitoring

### Step 23: Monitor Kubernetes with Prometheus

**Install Node Exporter in Kubernetes using Helm:**

```powershell
# Add Prometheus Helm repository
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts

# Update Helm repos
helm repo update

# Create namespace
kubectl create namespace prometheus-node-exporter

# Install Node Exporter
helm install prometheus-node-exporter prometheus-community/prometheus-node-exporter --namespace prometheus-node-exporter

# Verify installation
kubectl get pods -n prometheus-node-exporter
```

**Update Prometheus Configuration on Monitoring Server:**

1. **Get Node IP from EKS:**
   - Go to AWS Console → EKS → Clusters → `zwiggato-cluster`
   - Click **Compute** tab → **Nodes**
   - Click on a node
   - Click on **Instance ID**
   - Copy the **Public IP**

2. **SSH to Monitoring Server:**
   ```bash
   ssh -i your-key.pem ubuntu@<monitoring-server-ip>
   ```

3. **Edit Prometheus config:**
   ```bash
   sudo vi /etc/prometheus/prometheus.yml
   ```

4. **Add K8s job at the end:**
   ```yaml
   - job_name: 'k8s'
     metrics_path: '/metrics'
     static_configs:
       - targets: ['<node-ip>:9100']
   ```

   Replace `<node-ip>` with the Public IP from step 1

5. **Validate and reload:**
   ```bash
   promtool check config /etc/prometheus/prometheus.yml
   curl -X POST http://localhost:9090/-/reload
   ```

6. **Open Security Group for Node:**
   - Go to EC2 → Security Groups
   - Find security group for EKS nodes
   - Add Inbound Rule: Port 9100, Source: Monitoring Server IP

**Verify in Prometheus:**
- Open: `http://<monitoring-server-ip>:9090/targets`
- Should see `k8s (1/1 up)` or similar

---

### Step 24: Access Application

**Get NodePort or LoadBalancer URL:**

```powershell
# Check frontend service
kubectl get svc -n zwiggato

# If using LoadBalancer, get EXTERNAL-IP
# If using NodePort, access via: http://<node-ip>:<nodeport>
```

**Access Application:**
- Frontend: `http://<loadbalancer-ip>` or `http://<node-ip>:<nodeport>`
- Backend: Internal service (or expose via LoadBalancer if needed)

**Note:** Make sure security groups allow traffic on required ports!

---

## ✅ Verification Checklist

### Infrastructure
- [ ] EC2 Instance for Jenkins is running
- [ ] EC2 Instance for Monitoring is running
- [ ] Security groups are properly configured
- [ ] All required ports are open

### Jenkins
- [ ] Jenkins is accessible at `http://<ip>:8080`
- [ ] Jenkins is configured with admin user
- [ ] All required plugins are installed
- [ ] Java 17 is installed
- [ ] Node.js is configured
- [ ] SonarQube Scanner is configured

### Docker
- [ ] Docker is installed and running
- [ ] Docker version is verified
- [ ] Jenkins user has Docker permissions
- [ ] Docker socket permissions are correct

### SonarQube
- [ ] SonarQube container is running
- [ ] SonarQube is accessible at `http://<ip>:9000`
- [ ] SonarQube token is created
- [ ] SonarQube is configured in Jenkins
- [ ] SonarQube webhook is created

### Security Tools
- [ ] Trivy is installed
- [ ] Docker Scout is configured

### Monitoring
- [ ] Prometheus is running
- [ ] Prometheus is accessible at `http://<ip>:9090`
- [ ] Node Exporter is running
- [ ] Prometheus targets are UP
- [ ] Grafana is installed and accessible
- [ ] Grafana has Prometheus data source configured
- [ ] Dashboards are imported

### EKS
- [ ] EKS cluster is created
- [ ] Node group is created
- [ ] kubectl is configured
- [ ] Nodes are in Ready state

### Kubernetes Deployment
- [ ] All pods are Running
- [ ] Services are created
- [ ] Application is accessible

### ArgoCD
- [ ] ArgoCD is installed
- [ ] ArgoCD server is accessible
- [ ] ArgoCD login works

### Pipeline
- [ ] Jenkins pipeline job is created
- [ ] Pipeline runs successfully
- [ ] Docker images are built
- [ ] Images are pushed to DockerHub
- [ ] Containers are deployed
- [ ] Email notifications are working

---

## 🔧 Troubleshooting

### Jenkins Issues

**Docker permission denied:**
```bash
sudo usermod -aG docker jenkins
sudo chmod 777 /var/run/docker.sock
sudo systemctl restart jenkins
```

**Pipeline fails at Docker build:**
- Check Docker daemon: `sudo systemctl status docker`
- Check Docker socket: `ls -la /var/run/docker.sock`
- Restart Docker: `sudo systemctl restart docker`

**Jenkins not accessible:**
- Check security group: Port 8080 should be open
- Check Jenkins status: `sudo systemctl status jenkins`
- Check logs: `sudo tail -f /var/log/jenkins/jenkins.log`

### SonarQube Issues

**SonarQube not accessible:**
```bash
# Check container
docker ps
docker logs sonar

# Restart if needed
docker restart sonar
```

**SonarQube out of memory:**
```bash
# Increase Docker memory limit in Docker settings
# Or use larger instance
```

### Prometheus Issues

**Targets showing DOWN:**
- Check firewall/security groups
- Verify IP addresses in prometheus.yml
- Check if services are running
- Verify ports are correct

**Configuration errors:**
```bash
# Validate config
promtool check config /etc/prometheus/prometheus.yml

# Reload config
curl -X POST http://localhost:9090/-/reload
```

### EKS Issues

**Cluster creation fails:**
- Check IAM permissions
- Verify AWS CLI configuration
- Check CloudFormation stack for errors
- Ensure sufficient quotas

**kubectl connection issues:**
```powershell
# Re-configure kubectl
aws eks update-kubeconfig --region ap-northeast-1 --name zwiggato-cluster

# Check AWS credentials
aws sts get-caller-identity
```

**Pods not starting:**
```powershell
# Check pod status
kubectl get pods -n zwiggato

# Check pod logs
kubectl logs <pod-name> -n zwiggato

# Check events
kubectl get events -n zwiggato --sort-by='.lastTimestamp'
```

### ArgoCD Issues

**Cannot access ArgoCD:**
- Wait 5-10 minutes for LoadBalancer creation
- Check service status: `kubectl get svc -n argocd`
- Verify security groups allow traffic

**Password issues:**
```powershell
# Get password again
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d
```

---

## 📝 Important Notes

1. **Security:**
   - Always use secrets management for sensitive data
   - Don't hardcode credentials in files
   - Use IAM roles where possible
   - Regularly rotate tokens and passwords

2. **Cost Management:**
   - Monitor AWS costs regularly
   - EKS cluster costs money even when idle
   - Consider stopping instances when not in use
   - Use smaller instance types for testing

3. **Backups:**
   - Regular backups of Prometheus data
   - Backup Jenkins configurations
   - Backup Kubernetes manifests

4. **Updates:**
   - Keep all tools updated
   - Apply security patches regularly
   - Test updates in staging first

5. **Documentation:**
   - Document all changes
   - Keep credentials secure
   - Document custom configurations

---

## 📚 Additional Resources

- [Jenkins Documentation](https://www.jenkins.io/doc/)
- [Docker Documentation](https://docs.docker.com/)
- [SonarQube Documentation](https://docs.sonarqube.org/)
- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [EKS Documentation](https://docs.aws.amazon.com/eks/)
- [ArgoCD Documentation](https://argo-cd.readthedocs.io/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)

---

## 🎯 Next Steps

After completing this setup:

1. **Optimize Pipeline:**
   - Add more test stages
   - Implement blue-green deployments
   - Add performance testing

2. **Enhance Monitoring:**
   - Set up alerts in Grafana
   - Configure alerting rules in Prometheus
   - Add custom metrics

3. **Improve Security:**
   - Implement secrets management (AWS Secrets Manager)
   - Add vulnerability scanning in pipeline
   - Implement network policies in Kubernetes

4. **Automation:**
   - Automate backups
   - Implement GitOps with ArgoCD
   - Add automated rollbacks

---

**Last Updated:** 2024
**Project:** Zwiggato Food Delivery Platform
**Based on:** Dr. Kastro Kiran's DevOps Project Template

