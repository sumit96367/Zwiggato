#!/bin/bash
#
# Zwiggato DevOps Setup Script - Jenkins Server Installation
# This script automates the installation of Jenkins, Docker, Trivy, and SonarQube
# Run with: sudo bash setup-jenkins-server.sh
#

set -e

echo "========================================="
echo "Zwiggato DevOps Setup - Jenkins Server"
echo "========================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "Please run as root (use sudo)"
    exit 1
fi

# Update system
echo "[1/10] Updating system packages..."
apt update -y
apt upgrade -y

# Install AWS CLI
echo "[2/10] Installing AWS CLI..."
apt install unzip -y
if ! command -v aws &> /dev/null; then
    curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
    unzip awscliv2.zip
    ./aws/install
    rm -rf aws awscliv2.zip
    echo "AWS CLI installed successfully"
else
    echo "AWS CLI already installed"
fi

# Install Java 17
echo "[3/10] Installing Java 17 (Temurin)..."
wget -O - https://packages.adoptium.net/artifactory/api/gpg/key/public | tee /etc/apt/keyrings/adoptium.asc > /dev/null
echo "deb [signed-by=/etc/apt/keyrings/adoptium.asc] https://packages.adoptium.net/artifactory/deb $(awk -F= '/^VERSION_CODENAME/{print$2}' /etc/os-release) main" | tee /etc/apt/sources.list.d/adoptium.list > /dev/null
apt update -y
apt install temurin-17-jdk -y
java --version

# Install Node.js system dependencies (required for Node.js)
echo "[3.5/10] Installing Node.js system dependencies..."
apt install -y libatomic1 build-essential
echo "Node.js dependencies installed"

# Install Jenkins
echo "[4/10] Installing Jenkins..."
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | tee /usr/share/keyrings/jenkins-keyring.asc > /dev/null
echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] https://pkg.jenkins.io/debian-stable binary/ | tee /etc/apt/sources.list.d/jenkins.list > /dev/null
apt-get update -y
apt-get install jenkins -y
systemctl start jenkins
systemctl enable jenkins
echo "Jenkins installed and started"
echo "Get initial password with: sudo cat /var/lib/jenkins/secrets/initialAdminPassword"

# Install Docker
echo "[5/10] Installing Docker..."
apt-get install ca-certificates curl -y
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
apt-get update -y
apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin -y
usermod -aG docker ubuntu
usermod -aG docker jenkins
chmod 777 /var/run/docker.sock
systemctl restart jenkins
docker --version
echo "Docker installed successfully"

# Install Trivy
echo "[6/10] Installing Trivy..."
apt-get install wget apt-transport-https gnupg -y
wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | gpg --dearmor | tee /usr/share/keyrings/trivy.gpg > /dev/null
echo "deb [signed-by=/usr/share/keyrings/trivy.gpg] https://aquasecurity.github.io/trivy-repo/deb generic main" | tee -a /etc/apt/sources.list.d/trivy.list > /dev/null
apt-get update -y
apt-get install trivy -y
trivy --version
echo "Trivy installed successfully"

# Install SonarQube
echo "[7/10] Installing SonarQube..."
if ! docker ps -a | grep -q sonar; then
    docker run -d --name sonar -p 9000:9000 sonarqube:lts-community
    echo "SonarQube container started"
    echo "Wait 2-3 minutes for SonarQube to be ready"
    echo "Access at: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):9000"
    echo "Default credentials: admin/admin"
else
    echo "SonarQube container already exists"
    docker start sonar
fi

echo ""
echo "========================================="
echo "Installation Complete!"
echo "========================================="
echo ""
echo "Next Steps:"
echo "1. Access Jenkins: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):8080"
echo "2. Get Jenkins password: sudo cat /var/lib/jenkins/secrets/initialAdminPassword"
echo "3. Access SonarQube: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):9000"
echo "4. Configure Jenkins plugins and credentials"
echo ""
echo "See ZWIGGATO_DEVOPS_STEP_BY_STEP.md for detailed configuration steps"
echo ""

