# DevOps Quick Reference Guide - Zwiggato

## 🚀 Quick Setup Checklist

### Before You Start

- [ ] AWS Account with appropriate permissions
- [ ] DockerHub account
- [ ] GitHub repository (public or private with credentials)
- [ ] Email account for notifications (Gmail recommended)

### Step-by-Step Order

1. **EC2 Instance Setup** → Install Jenkins → Install Docker → Install Trivy
2. **SonarQube Setup** → Install via Docker → Configure in Jenkins
3. **Jenkins Configuration** → Install Plugins → Configure Credentials → Configure Email
4. **Pipeline Setup** → Update Jenkinsfile → Create Pipeline Job
5. **Monitoring Setup** → Launch Monitoring Server → Install Prometheus → Install Node Exporter → Install Grafana
6. **Kubernetes Setup** → Create EKS Cluster → Deploy Application → Install ArgoCD

---

## 📝 Important Configurations

### Jenkinsfile Changes Required

1. **Line 11:** Change `your-dockerhub-username` to your DockerHub username
2. **Line 240:** Change `your-email@example.com` to your email address

### DockerHub Username

Replace all instances of `your-dockerhub-username` in:
- `Jenkinsfile`
- `k8s/backend-deployment.yaml`
- `k8s/frontend-deployment.yaml`

### Email Configuration

For Gmail:
- Enable 2-factor authentication
- Generate App Password: https://myaccount.google.com/apppasswords
- Use App Password in Jenkins email configuration

---

## 🔑 Credentials Setup in Jenkins

### Required Credentials

1. **SonarQube Token** (ID: `Sonar-token`)
   - Type: Secret text
   - Generate in SonarQube: Administration → Security → Users → Generate Token

2. **DockerHub Credentials** (ID: `docker`)
   - Type: Username with password
   - Username: Your DockerHub username
   - Password: DockerHub password or access token

3. **GitHub Credentials** (if private repo)
   - Type: SSH Username with private key or Username with password

---

## 🛠️ Jenkins Tools Configuration

### Required Tools

1. **JDK 17**
   - Name: `jdk17`
   - Path: `/usr/lib/jvm/temurin-17-jdk-amd64`

2. **Node.js 18**
   - Name: `node18`
   - Install automatically from nodejs.org

3. **SonarQube Scanner**
   - Name: `sonar-scanner`
   - Install automatically

---

## 📊 Ports Configuration

### EC2 Instance Security Group

| Port | Service | Purpose |
|------|---------|---------|
| 22 | SSH | Server access |
| 8080 | Jenkins | CI/CD pipeline |
| 9000 | SonarQube | Code quality |
| 9090 | Prometheus | Metrics collection |
| 3000 | Grafana | Monitoring dashboard |
| 9100 | Node Exporter | System metrics |

### Application Ports

| Port | Service | Purpose |
|------|---------|---------|
| 3000 | Frontend | Web application |
| 5000 | Backend | API server |
| 27017 | MongoDB | Database |

---

## 🐳 Docker Images

### Image Names

- Backend: `your-dockerhub-username/zwiggato-backend:latest`
- Frontend: `your-dockerhub-username/zwiggato-frontend:latest`

### Manual Build Commands

```bash
# Backend
cd backend
docker build -t your-dockerhub-username/zwiggato-backend:latest .
docker push your-dockerhub-username/zwiggato-backend:latest

# Frontend
cd frontend
docker build -t your-dockerhub-username/zwiggato-frontend:latest .
docker push your-dockerhub-username/zwiggato-frontend:latest
```

---

## ☸️ Kubernetes Deployment

### Update Deployment Files

Before deploying to Kubernetes, update these files:

1. **k8s/backend-deployment.yaml**
   - Line 18: Update image to `your-dockerhub-username/zwiggato-backend:latest`

2. **k8s/frontend-deployment.yaml**
   - Line 18: Update image to `your-dockerhub-username/zwiggato-frontend:latest`

### Deployment Order

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/mongodb-pvc.yaml
kubectl apply -f k8s/mongodb-deployment.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml
```

---

## 🔍 Common Issues & Solutions

### Issue: Jenkins Pipeline Fails at Docker Build

**Solution:**
```bash
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
sudo chmod 777 /var/run/docker.sock
```

### Issue: SonarQube Not Accessible

**Solution:**
```bash
docker ps  # Check if container is running
docker logs sonar  # Check logs
docker restart sonar
```

### Issue: Prometheus Targets Down

**Solution:**
1. Check firewall/security group rules
2. Verify port numbers in prometheus.yml
3. Test connectivity: `curl http://target-ip:port`

### Issue: EKS Cluster Creation Fails

**Solution:**
1. Check IAM permissions
2. Verify AWS CLI configuration: `aws sts get-caller-identity`
3. Check CloudFormation stack for errors

### Issue: kubectl Connection Refused

**Solution:**
```bash
aws eks update-kubeconfig --region ap-northeast-1 --name zwiggato-cluster
kubectl get nodes
```

---

## 📧 Email Notification Test

To test email configuration:

1. Go to **Manage Jenkins → System**
2. Scroll to **E-mail Notification**
3. Click **Test configuration by sending test e-mail**
4. Enter your email address
5. Click **Test**

---

## 🔐 Security Best Practices

1. **Never commit secrets to Git**
   - Use Jenkins credentials
   - Use Kubernetes secrets
   - Use environment variables

2. **Rotate credentials regularly**
   - DockerHub tokens
   - SonarQube tokens
   - AWS access keys

3. **Use least privilege**
   - Limit IAM permissions
   - Use service accounts in Kubernetes

4. **Enable HTTPS** (Production)
   - Use SSL certificates
   - Enable HTTPS in Jenkins, SonarQube, Grafana

---

## 📈 Monitoring URLs

### Local Access (from EC2 instance)

- Jenkins: `http://localhost:8080`
- SonarQube: `http://localhost:9000`
- Prometheus: `http://localhost:9090`
- Grafana: `http://localhost:3000`

### External Access (from browser)

- Jenkins: `http://<ec2-ip>:8080`
- SonarQube: `http://<ec2-ip>:9000`
- Prometheus: `http://<monitoring-server-ip>:9090`
- Grafana: `http://<monitoring-server-ip>:3000`

---

## 🧹 Cleanup Commands

### Stop All Containers
```bash
docker stop $(docker ps -aq)
docker rm $(docker ps -aq)
```

### Remove Docker Images
```bash
docker rmi $(docker images -q)
```

### Delete EKS Cluster
```powershell
eksctl delete cluster zwiggato-cluster --region ap-northeast-1
```

### Delete Node Group First
```powershell
eksctl delete nodegroup --cluster=zwiggato-cluster --name=zwiggato-ng-public1
```

---

## 📞 Support Resources

- **Jenkins Docs:** https://www.jenkins.io/doc/
- **Docker Docs:** https://docs.docker.com/
- **Kubernetes Docs:** https://kubernetes.io/docs/
- **AWS EKS Docs:** https://docs.aws.amazon.com/eks/

---

## ✅ Final Verification

After setup, verify:

- [ ] Jenkins pipeline runs successfully
- [ ] Docker images are pushed to DockerHub
- [ ] SonarQube analysis completes
- [ ] Prometheus shows all targets UP
- [ ] Grafana dashboards are visible
- [ ] Application is deployed in EKS
- [ ] Email notifications are received

---

**Remember:** Always replace placeholders like `your-dockerhub-username` and `your-email@example.com` with your actual values!

