# 🧶 Craft Application

![Python](https://img.shields.io/badge/Python-3.11-blue)
![Django](https://img.shields.io/badge/Django-5.0-green)
![DRF](https://img.shields.io/badge/DRF-Rest_Framework-red)
![Daphne](https://img.shields.io/badge/Server-Daphne_HTTP%2F2-blueviolet)
![Docker](https://img.shields.io/badge/Docker-Containerized-blue)
![License](https://img.shields.io/badge/License-MIT-lightgrey)

## 📌 Overview

**Craft** is a comprehensive multi-vendor marketplace and e-learning platform designed to connect handcraft suppliers with customers through a scalable and feature-rich ecosystem.

The platform integrates multiple advanced systems into a single architecture, including:

- 🛒 E-commerce Operations
- 🎓 E-Learning Features
- 💬 Real-Time Communication
- 🤝 Social Networking
- 📦 Delivery Management
- 🤖 Smart Recommendations

The project follows scalable backend architecture principles using Django and modern DevOps-friendly technologies, and is fully optimized for production environments.

---

# 📋 Table of Contents

- [Key Features](#-key-features)
- [Technical Architecture](#-technical-architecture)
- [User Interfaces](#-user-interfaces)
- [Prerequisites](#-prerequisites)
- [Installation Using Docker](#-installation-using-docker)
- [Manual Installation](#-manual-installation)
- [Environment Configuration](#-environment-configuration)
- [Production Deployment (Railway)](#-production-deployment-(railway))
- [API Documentation](#-api-documentation)
- [Contributing](#-contributing)
- [Contact](#-contact)

---

# 🚀 Key Features

## 🛒 E-Commerce System

- Multi-vendor marketplace architecture
- Product and inventory management
- Cart and order lifecycle management
- Integrated Stripe payment gateway
- Wallet and refund system
- Coupons and discount handling

---

## 🎓 E-Learning Platform

- Video course uploading for suppliers
- Course enrollment and progress tracking
- Course completion certificates

---

## 💬 Real-Time & Social Features

- Real-time chat using Django Channels and WebSockets
- Redis-powered messaging infrastructure
- Follow suppliers and interact socially
- Activity feeds and engagement system
- Real-time notifications

---

## 🤖 Smart Services & Background Tasks

- Recommendation engine for products and courses
- Background task processing using Celery and Celery Beat
- Email sending and asynchronous report generation
- Automated recurring jobs via DatabaseScheduler

---

# 🛠 Technical Architecture

| Component | Technology |
|---|---|
| Backend Framework | Django 5.0 |
| REST API Layer | Django REST Framework |
| ASGI Server (HTTP/2 & WebSockets) | Daphne |
| Primary Database | PostgreSQL |
| Cache & Message Broker | Redis |
| Background & Scheduled Tasks | Celery & Celery Beat |
| Real-Time Communication | Django Channels |
| Static File Serving (Compressed & Manifested) | WhiteNoise |
| Containerization | Docker & Docker Compose |
| Authentication | JWT (SimpleJWT) & Social Auth |
| API Documentation | Swagger (drf-yasg) |

---

# 👥 User Interfaces

The backend serves three separate frontend applications:

### 1️⃣ Customer Application
- Browse products
- Purchase courses
- Social interactions
- Track orders

### 2️⃣ Supplier Dashboard
- Product management
- Course management
- Sales analytics
- Order handling

### 3️⃣ Delivery Application
- Shipment tracking
- Delivery status updates
- Driver workflow management

---
<a id="prerequisites"></a>
# ⚙️ Prerequisites

Before running the project, ensure you have:

- Python 3.11
- PostgreSQL
- Redis Server
- Docker & Docker Compose (Recommended)
- Git

---

# 🐳 Installation Using Docker

The recommended way to run the project locally. The provided `docker-compose.yml` spins up Django (Daphne), PostgreSQL, Redis, Celery Worker, and Celery Beat.

## 1️⃣ Clone Repository

```bash
git clone https://github.com/Waleeddarwesh/Craft-v1.2.git
cd Craft-v1.2
```

---

## 2️⃣ Create Environment File

Create a `.env` file in the root directory.

Example configuration is available below in the Environment Configuration section.

---

## 3️⃣ Build and Run Containers

```bash
docker compose up --build -d
```

This will automatically start:

* Django ASGI Server (Daphne)
* PostgreSQL Database
* Redis Server
* Celery Workers
* Celery Beat Scheduler

---

# 🔧 Manual Installation

## 1️⃣ Create Virtual Environment

### Linux / macOS

```bash
python -m venv venv
source venv/bin/activate
```

### Windows

```bash
python -m venv venv
venv\Scripts\activate
```

---

## 2️⃣ Install Dependencies

```bash
pip install -r requirements.txt
```

---

## 3️⃣ Configure Environment Variables

Create `.env` file in the root directory (see [Environment Configuration](#-environment-configuration)).

---

## 4️⃣ Apply Database Migrations

```bash
python manage.py migrate
```

---

## 5️⃣ Create Superuser

```bash
python manage.py createsuperuser
```

---

## 6️⃣ Run Development Server

To support WebSockets properly, use Daphne:

```bash
daphne -b 0.0.0.0 -p 8000 Handcrafts.asgi:application
```

*(Alternatively, `python manage.py runserver` works for standard HTTP testing).*

---

## 7️⃣ Run Redis & Celery

For chat and asynchronous tasks (ensure Redis server is running locally):

**Run Celery Worker:**
```bash
celery -A Handcrafts worker -l info -P solo
```

**Run Celery Beat (Scheduled Tasks):**
```bash
celery -A Handcrafts beat -l info --scheduler django_celery_beat.schedulers:DatabaseScheduler
```

---

# 🔐 Environment Configuration

Create a `.env` file in the project root.

```ini
# Project Config
ENVIRONMENT=development  # Set to 'production' for security hardening
DEBUG=True
SECRET_KEY=your_secret_key

# Security
ALLOWED_HOSTS=localhost,127.0.0.1,testserver
CORS_ALLOWED_ORIGINS=http://localhost:8000
CSRF_TRUSTED_ORIGINS=http://localhost:8000

# PostgreSQL
DATABASE_URL=postgres://user:password@localhost:5432/craft_db

# Redis & Celery
REDIS_URL=redis://localhost:6379/0
CELERY_BROKER_URL=redis://localhost:6379/0

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Email Service
EMAIL_HOST=sandbox.smtp.mailtrap.io
EMAIL_HOST_USER=your_user
EMAIL_HOST_PASSWORD=your_password
```

---

# ☁️ Production Deployment (Railway)

This application is fully optimized for continuous deployment on **Railway** using the included `railway.json` and `Procfile`.

*   **Daphne ASGI Server:** Handles standard requests and WebSockets gracefully in production.
*   **Release Phase:** Automatically runs `python manage.py migrate` during the build process.
*   **Static Files:** Served efficiently via WhiteNoise.
*   **Security Hardened:** Setting `ENVIRONMENT=production` enables strict HSTS, XSS protection, and Content-Type sniffing filters.

**To deploy:** Connect your GitHub repository to Railway, configure your PostgreSQL and Redis plugins, and populate the environment variables.

---

# 📖 API Documentation

After running the server:

### Swagger UI

http://localhost:8000/docs/

### Redoc Documentation

http://localhost:8000/redoc/

---

# 🤝 Contributing

1️⃣ Fork the repository

2️⃣ Create feature branch

```bash
git checkout -b feature/AmazingFeature
```

3️⃣ Commit changes

```bash
git commit -m "Add Amazing Feature"
```

4️⃣ Push to GitHub

```bash
git push origin feature/AmazingFeature
```

5️⃣ Open Pull Request

---

# 📞 Contact

## Waleed Darwesh

Backend Software Engineer | Django Developer | Cloud DevOps Engineer

📧 Email:
[Waleeddarwesh2002@gmail.com](mailto:Waleeddarwesh2002@gmail.com)

🔗 LinkedIn:
https://www.linkedin.com/in/waleeddarwesh1/

🔗 GitHub:
https://github.com/Waleeddarwesh

---
