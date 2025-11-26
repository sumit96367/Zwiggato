#!/bin/bash
#
# Zwiggato DevOps Setup Script - Monitoring Server Installation
# This script automates the installation of Prometheus, Node Exporter, and Grafana
# Run with: sudo bash setup-monitoring-server.sh
#

set -e

echo "========================================="
echo "Zwiggato DevOps Setup - Monitoring Server"
echo "========================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "Please run as root (use sudo)"
    exit 1
fi

# Get Jenkins IP (prompt user)
read -p "Enter Jenkins Server IP: " JENKINS_IP
if [ -z "$JENKINS_IP" ]; then
    echo "Jenkins IP is required. Exiting."
    exit 1
fi

# Get Monitoring Server IP
MONITORING_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)

echo "[1/5] Installing Prometheus..."
# Create Prometheus user
useradd --system --no-create-home --shell /bin/false prometheus 2>/dev/null || true

# Download Prometheus
cd /tmp
wget -q https://github.com/prometheus/prometheus/releases/download/v2.47.1/prometheus-2.47.1.linux-amd64.tar.gz
tar -xzf prometheus-2.47.1.linux-amd64.tar.gz
cd prometheus-2.47.1.linux-amd64/

# Create directories and move files
mkdir -p /data /etc/prometheus
mv prometheus promtool /usr/local/bin/
mv consoles/ console_libraries/ /etc/prometheus/
mv prometheus.yml /etc/prometheus/prometheus.yml
chown -R prometheus:prometheus /etc/prometheus/ /data/

# Create systemd service
cat > /etc/systemd/system/prometheus.service <<EOF
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
ExecStart=/usr/local/bin/prometheus \\
  --config.file=/etc/prometheus/prometheus.yml \\
  --storage.tsdb.path=/data \\
  --web.console.templates=/etc/prometheus/consoles \\
  --web.console.libraries=/etc/prometheus/console_libraries \\
  --web.listen-address=0.0.0.0:9090 \\
  --web.enable-lifecycle

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable prometheus
systemctl start prometheus
echo "Prometheus installed and started"

# Cleanup
cd ~
rm -rf /tmp/prometheus-2.47.1.linux-amd64*

echo "[2/5] Installing Node Exporter..."
# Create Node Exporter user
useradd --system --no-create-home --shell /bin/false node_exporter 2>/dev/null || true

# Download Node Exporter
cd /tmp
wget -q https://github.com/prometheus/node_exporter/releases/download/v1.6.1/node_exporter-1.6.1.linux-amd64.tar.gz
tar -xzf node_exporter-1.6.1.linux-amd64.tar.gz
mv node_exporter-1.6.1.linux-amd64/node_exporter /usr/local/bin/
rm -rf node_exporter*

# Create systemd service
cat > /etc/systemd/system/node_exporter.service <<EOF
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
EOF

systemctl daemon-reload
systemctl enable node_exporter
systemctl start node_exporter
echo "Node Exporter installed and started"

echo "[3/5] Configuring Prometheus..."
# Update Prometheus configuration
cat >> /etc/prometheus/prometheus.yml <<EOF

  - job_name: 'node_exporter'
    static_configs:
      - targets: ['${MONITORING_IP}:9100']

  - job_name: 'jenkins'
    metrics_path: '/prometheus'
    static_configs:
      - targets: ['${JENKINS_IP}:8080']
EOF

# Validate configuration
promtool check config /etc/prometheus/prometheus.yml

# Reload Prometheus
sleep 2
curl -X POST http://localhost:9090/-/reload || true
echo "Prometheus configuration updated"

echo "[4/5] Installing Grafana..."
apt-get update -y
apt-get install -y apt-transport-https software-properties-common
wget -q -O - https://packages.grafana.com/gpg.key | apt-key add -
echo "deb https://packages.grafana.com/oss/deb stable main" | tee -a /etc/apt/sources.list.d/grafana.list > /dev/null
apt-get update -y
apt-get install -y grafana
systemctl enable grafana-server
systemctl start grafana-server
echo "Grafana installed and started"

echo ""
echo "========================================="
echo "Monitoring Server Setup Complete!"
echo "========================================="
echo ""
echo "Access URLs:"
echo "- Prometheus: http://${MONITORING_IP}:9090"
echo "- Grafana: http://${MONITORING_IP}:3000 (admin/admin)"
echo ""
echo "Next Steps:"
echo "1. Access Prometheus and verify targets at: http://${MONITORING_IP}:9090/targets"
echo "2. Login to Grafana and add Prometheus data source (http://localhost:9090)"
echo "3. Import dashboards:"
echo "   - Node Exporter: Dashboard ID 1860"
echo "   - Jenkins: Dashboard ID 9964"
echo ""
echo "See ZWIGGATO_DEVOPS_STEP_BY_STEP.md for detailed configuration steps"
echo ""

