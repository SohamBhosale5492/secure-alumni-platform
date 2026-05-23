# Secure Alumni Management and Engagement Platform

A full-stack alumni platform integrated with a reusable Express.js web application security monitoring and intrusion detection system.

The project has two independent but integrated systems:

- `alumni-platform`: React frontend and Express backend for alumni engagement workflows.
- `security-system`: reusable middleware package for request monitoring, threat scoring, alerts, IP blocking, upload inspection, and SOC dashboard APIs.

## Project Structure

```text
alumni-platform/
  frontend/              React + Vite client
  backend/               Express API for alumni workflows
security-system/
  middleware/            Request and upload monitoring middleware
  detection-engine/      Brute force, abuse, scoring, and IP block logic
  monitoring-dashboard/  Admin SOC API routes
  alert-system/          Alert persistence service
  models/                Security logs, alerts, blocked IP schemas
database/                Schema notes and Atlas guidance
```

## Core Security Features

- Express middleware integration with `app.use(createSecurityMonitor())`
- Request telemetry with IP, route, status, user agent, location, score, and action
- Brute-force login tracking with warning, cooldown, CAPTCHA, and account lock stages
- API abuse detection with temporary IP blocks at high request volume
- Injection and XSS payload detection
- Suspicious upload blocking for dangerous extensions, MIME mismatches, and excessive uploads
- Threat scoring and Safe/Warning/Dangerous classification
- SOC dashboard routes for stats, logs, alerts, blocked IPs, and chart data

## Local Setup

1. Install dependencies from the repository root:

```bash
npm install
```

2. Configure the backend:

```bash
cp alumni-platform/backend/.env.example alumni-platform/backend/.env
```

Set `MONGODB_URI`, `JWT_SECRET`, and `CORS_ORIGIN`.

For local demos without MongoDB installed, set `USE_MEMORY_DB=true`. This starts an in-memory MongoDB instance for development only; use MongoDB Atlas for deployment.

3. Configure the frontend:

```bash
cp alumni-platform/frontend/.env.example alumni-platform/frontend/.env
```

4. Run both services in separate terminals:

```bash
npm run dev:backend
npm run dev:frontend
```

The API runs on `http://localhost:5000` and the frontend runs on `http://localhost:5173`.

## First Account

The first registered user becomes an admin automatically. Later users cannot self-register as admin.

## CAPTCHA Demonstration

After repeated failed login attempts, the backend requires a CAPTCHA token. For the educational demo, use the value in `DEMO_CAPTCHA_TOKEN` from the backend environment.

## Deployment

### MongoDB Atlas

Create an Atlas cluster, allow the Render service IP or `0.0.0.0/0` for a classroom demo, create a database user, and set the connection string as `MONGODB_URI`.

### Render Backend

Deploy from the repository root so the `security-system` package is available.

- Build command: `npm install`
- Start command: `npm run start:backend`
- Environment variables: values from `alumni-platform/backend/.env.example`

### Vercel Frontend

Set the Vercel project root to `alumni-platform/frontend`.

- Build command: `npm run build`
- Output directory: `dist`
- Environment variable: `VITE_API_URL=https://your-render-service.onrender.com/api`

## Main API Groups

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/users/directory`
- `PUT /api/users/me/profile`
- `POST /api/uploads/profile-image`
- `POST /api/uploads/resume`
- `GET /api/events`
- `POST /api/events`
- `GET /api/mentorships`
- `POST /api/mentorships`
- `GET /api/opportunities`
- `POST /api/opportunities`
- `GET /api/security/stats`
- `GET /api/security/logs`
- `GET /api/security/alerts`
- `GET /api/security/blocked-ips`

## Reusing the Security System

Install or copy the `security-system` package into another Express app and wire it like this:

```javascript
const {
  createSecurityMonitor,
  securityDashboardRoutes,
} = require("security-system");

app.use(createSecurityMonitor());
app.use(
  "/api/security",
  authenticateAdmin,
  securityDashboardRoutes({ userModel: User }),
);
```

For authentication routes, call `recordFailedLogin`, `recordSuccessfulLogin`, and `evaluateLoginDefense` from the package to activate adaptive brute-force protection.
