# Zwiggato - Food Delivery Platform

A full-stack food delivery web application with three user roles (Customer, Restaurant, Admin) demonstrating modern web development and DevOps principles.

## 🏗️ Architecture Overview

```
Zwiggato/
├── frontend/          # React.js frontend application
├── backend/           # Node.js/Express.js backend API
├── k8s/              # Kubernetes deployment manifests
├── terraform/        # Infrastructure as Code (AWS)
├── .github/          # GitHub Actions CI/CD workflows
└── docs/             # Documentation and diagrams
```

## 🛠️ Tech Stack

### Frontend
- **React.js** with React Router for navigation
- **Context API** for state management
- **Tailwind CSS** for styling
- **Axios** for API calls

### Backend
- **Node.js** with **Express.js** for RESTful API
- **JWT** for authentication and authorization
- **Bcrypt** for password hashing
- **Mongoose** for MongoDB ORM

### Database
- **MongoDB** with schemas for Users, Restaurants, MenuItems, Orders, Reviews

### DevOps
- **Docker** and **Docker Compose** for containerization
- **Kubernetes** for orchestration
- **Terraform** for AWS infrastructure
- **GitHub Actions** for CI/CD pipeline
- **Nginx** as reverse proxy

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- Docker and Docker Compose
- MongoDB (or use Docker Compose)
- kubectl (for Kubernetes deployment)
- Terraform (for infrastructure provisioning)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Zwiggato
   ```

2. **Start services with Docker Compose**
   ```bash
   docker-compose up -d
   ```

3. **Seed the database**

   **Option A: Use sample data (Quick)**
   ```bash
   docker-compose exec backend npm run seed
   ```

   **Option B: Import Zomato dataset (Real-world data)**
   ```bash
   # 1. Download Zomato dataset from Kaggle
   # 2. Place zomato.csv in backend/data/
   # 3. Run import
   docker-compose exec backend npm run import:zomato
   ```
   See `QUICK_START_ZOMATO.md` for detailed instructions.

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - MongoDB: localhost:27017

## 📁 Project Structure

### Backend Structure
```
backend/
├── src/
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Auth, validation, error handling
│   ├── utils/           # Helper functions
│   └── config/          # Configuration files
├── tests/               # Test files
├── Dockerfile
└── package.json
```

### Frontend Structure
```
frontend/
├── src/
│   ├── components/      # Reusable components
│   ├── pages/          # Page components
│   ├── context/        # Context API providers
│   ├── services/       # API service functions
│   ├── utils/          # Helper functions
│   └── styles/         # CSS and Tailwind config
├── public/
├── Dockerfile
└── package.json
```

## 🔐 User Roles

### Customer
- Browse restaurants and menus
- Place orders
- Track orders in real-time
- Rate and review restaurants
- Manage delivery addresses

### Restaurant
- Manage menu items
- Accept/reject orders
- Update order status
- View analytics and revenue

### Admin
- Manage users and restaurants
- Oversee all orders
- View platform analytics
- Handle disputes and refunds

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 🐳 Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up --build

# Or build individual services
docker build -t zwiggato-backend ./backend
docker build -t zwiggato-frontend ./frontend
```

## ☸️ Kubernetes Deployment

```bash
# Apply all manifests
kubectl apply -f k8s/

# Check deployment status
kubectl get pods,services,deployments
```

## 🌐 Infrastructure (Terraform)

```bash
cd terraform
terraform init
terraform plan
terraform apply
```

## 📚 API Documentation

API documentation is available at `/api-docs` when the backend is running, or see `docs/API.md` for detailed endpoint documentation.

## 🔒 Security Features

- JWT authentication with refresh tokens
- Bcrypt password hashing (10 rounds)
- Input validation and sanitization
- Rate limiting
- CORS configuration
- SQL injection prevention
- XSS protection
- HTTPS enforcement

## 📊 Monitoring

- **Logging**: Winston for structured logging
- **Metrics**: Prometheus for metrics collection
- **Visualization**: Grafana dashboards
- **Alerts**: Configured for high error rates and downtime

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

Zwiggato Development Team

