# 🧶 Craft Application - Version 1.2

![Python](https://img.shields.io/badge/Python-3.11-blue) ![Django](https://img.shields.io/badge/Django-5.0-green) ![DRF](https://img.shields.io/badge/DRF-Rest_Framework-red) ![Daphne](https://img.shields.io/badge/Server-Daphne_HTTP%2F2-blueviolet) ![License](https://img.shields.io/badge/License-MIT-lightgrey)

**Craft** is a comprehensive platform integrating social, e-commerce, courses, and chat functionalities. It features **150+ endpoints** for seamless data flow across Customer, Crafter, and Delivery interfaces, bridging the gap between handcraft suppliers and their global audience.

## 📋 Table of Contents
- [Key Features](#key-features)
- [New in V1.2](#new-in-v12)
- [Technical Architecture](#technical-architecture)
- [Prerequisites](#prerequisites)
- [Installation (Manual)](#installation-manual)
- [Environment Configuration](#environment-configuration)
- [Production Deployment (Railway)](#production-deployment-railway)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Contact](#contact)

## Key Features

### 🛒 E-commerce Core
- **Marketplace:** Multi-vendor support allowing Crafters to manage products and stock.
- **Order Management:** Complex order lifecycle (Cart -> Order -> Shipment -> Delivery).
- **Financials:** Integrated **Stripe** payments, custom wallet system, and refund handling.

### 🎓 E-Learning Platform
- **Courses:** Crafters can upload video courses to teach their craft.
- **Progress Tracking:** Users can enroll in courses and track their learning progress.

### 💬 Social & Real-Time
- **Chat App:** Real-time messaging using **WebSockets (Django Channels)** and **Redis**.
- **Social Feed:** Follow system, product likes, and real-time notifications.

## New in V1.2

- **Production Hardening:** Strictly enforced security headers (HSTS, XSS Filter, Content-Type Sniffing).
- **Modern ASGI Server:** Switched to **Daphne** with native **HTTP/2** support.
- **Environment-Aware Config:** Professional `settings.py` structure using `django-environ`.
- **Database Optimization:** Implemented persistent connection pooling for high-performance production traffic.
- **Deployment Ready:** Pre-configured `Procfile` and `railway.json` for one-click cloud deployment.
- **Requirement Cleanup:** Audited and optimized dependencies for a lighter, conflict-free installation.

## Technical Architecture

* **Backend:** Django 5.0 & Django REST Framework
* **Real-Time:** Django Channels (ASGI) & Daphne
* **Database:** PostgreSQL (with Psycopg 3 support)
* **Async Tasks:** Celery 5.6 & Redis
* **Static Files:** WhiteNoise (Compressed & Manifested)
* **API Documentation:** Swagger (drf-yasg)

## Prerequisites
* Python 3.11.9
* PostgreSQL
* Redis Server
* Git

## Installation (Manual)

1.  **Clone the V1.2 repository:**
    ```bash
    git clone https://github.com/Waleeddarwesh/Craft-V1.2.git
    cd Craft-V1.2
    ```

2.  **Set Up Virtual Environment:**
    ```bash
    python -m venv venv
    venv\Scripts\activate  # Windows
    source venv/bin/activate  # Linux/macOS
    ```

3.  **Install Dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Configure Environment:**
    Create a `.env` file in the root directory (see [Environment Configuration](#environment-configuration)).

5.  **Apply Migrations & Run:**
    ```bash
    python manage.py migrate
    python manage.py runserver
    ```

## Environment Configuration

Create a `.env` file in the root directory. Version 1.2 uses the following structure:

```ini
# Project Config
ENVIRONMENT=development  # Set to 'production' for security hardening
DEBUG=True
SECRET_KEY=your_django_secret_key

# Security
ALLOWED_HOSTS=localhost,127.0.0.1,testserver
CORS_ALLOWED_ORIGINS=http://localhost:8000
CSRF_TRUSTED_ORIGINS=http://localhost:8000

# Database
DATABASE_URL=postgres://user:password@localhost:5432/db_name

# Redis & Celery
REDIS_URL=redis://localhost:6379/0
CELERY_BROKER_URL=redis://localhost:6379/0

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_HOST_USER=your_email@gmail.com
EMAIL_HOST_PASSWORD=your_app_password
```

## Production Deployment (Railway)

This version is optimized for **Railway**:
- **Automatic Migrations:** The `release` phase in `Procfile` handles migrations during build.
- **Build Optimized:** `railway.json` ensures static files are collected and built efficiently.
- **Daphne Ready:** The web process is pre-configured to run with Daphne for WebSocket support.

Simply connect your GitHub repo to Railway and set `ENVIRONMENT=production` in the variables.

## API Documentation
Once the server is running, you can access the interactive API documentation:

* **Swagger UI:** [http://localhost:8000/docs/](http://localhost:8000/docs/)

## Testing
V1.2 includes a comprehensive endpoint test suite:
```bash
python test_all_endpoints.py
```

## Contact
**Waleed Darwesh** - Backend Software Engineer  
📧 [Waleeddarwesh2002@gmail.com](mailto:Waleeddarwesh2002@gmail.com)  
🔗 [LinkedIn Profile](https://www.linkedin.com/in/Waleeddarwesh1)
