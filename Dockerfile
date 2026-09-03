# ---------- Frontend build ----------
FROM node:20-slim AS frontend-build

WORKDIR /app

COPY package.json package-lock.json ./

COPY alumni-platform/backend/package.json ./alumni-platform/backend/package.json
COPY alumni-platform/frontend/package.json ./alumni-platform/frontend/package.json
COPY security-system/package.json ./security-system/package.json

RUN npm ci

COPY alumni-platform/frontend ./alumni-platform/frontend

WORKDIR /app/alumni-platform/frontend

ENV VITE_API_URL=/api

RUN npm run build


# ---------- Final application ----------
FROM node:20-slim

WORKDIR /app

COPY package.json package-lock.json ./

COPY alumni-platform/backend/package.json ./alumni-platform/backend/package.json
COPY alumni-platform/frontend/package.json ./alumni-platform/frontend/package.json
COPY security-system/package.json ./security-system/package.json

RUN npm ci --omit=dev

COPY alumni-platform/backend ./alumni-platform/backend
COPY security-system ./security-system

COPY --from=frontend-build /app/alumni-platform/frontend/dist ./frontend-dist

WORKDIR /app/alumni-platform/backend

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

CMD ["node", "src/server.js"]