# TalentMind AI Setup & Deployment Guide

## 1. System Requirements

* **Operating System:** Linux (Ubuntu 20.04+, Debian 11+), macOS (12+), or Windows 10/11 with WSL2
* **Node.js:** Version 20.x or 22.x LTS
* **npm:** Version 10.x or higher
* **Memory:** Minimum 4 GB RAM (8 GB recommended for local builds)
* **Storage:** 2 GB free disk space

---

## 2. Environment Variables

### Backend (`backend/.env`):
```ini
NODE_ENV=development
PORT=5000
DATABASE_URL="file:./dev.db"

# JWT Security
JWT_SECRET="talentmind-super-secret-jwt-key-2026-production"
JWT_EXPIRES_IN="1d"
REFRESH_TOKEN_SECRET="talentmind-super-secret-refresh-key-2026-production"
REFRESH_TOKEN_EXPIRES_IN="7d"

# CORS
FRONTEND_URL="http://localhost:4200"

# Optional Cloud Integrations (Defaults to built-in deterministic mock provider)
AZURE_OPENAI_API_KEY=""
AZURE_OPENAI_ENDPOINT=""
AZURE_OPENAI_DEPLOYMENT_NAME=""
```

---

## 3. Step-by-Step Installation

### Step A: Clone & Backend Preparation
```bash
git clone git@github.com:starlord-9/AI-Screening-Interview-Platform.git
cd AI-Screening-Interview-Platform/backend

# Install dependencies
npm install

# Initialize Database
npx prisma generate
npx prisma migrate dev --name init

# Seed Realistic Demo Data
npm run db:seed

# Verify Tests
npm test

# Run Development Server
npm run dev
```

### Step B: Frontend Preparation
```bash
cd ../frontend

# Install dependencies
npm install

# Verify Tests & Build
npm test -- --watch=false
npm run build

# Start Dev Server
npm start
```

Visit `http://localhost:4200` to interact with the platform.

---

## 4. Production Docker Deployment

To launch the full production environment with automated Nginx reverse proxying, multi-stage builds, and volume persistence:

```bash
docker-compose up --build -d
```

Verify service status:
```bash
docker-compose ps
curl http://localhost:5000/health
```
