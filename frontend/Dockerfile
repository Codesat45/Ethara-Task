# ─────────────────────────────────────────────────────────────
# Stage 1 — Node build
# ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Accept the backend API URL at build time
ARG VITE_API_URL=http://localhost:8000/api/v1
ENV VITE_API_URL=$VITE_API_URL

# Install deps first (better layer caching)
COPY package*.json ./
RUN npm ci --prefer-offline

# Copy source and build
COPY . .
RUN npm run build

# ─────────────────────────────────────────────────────────────
# Stage 2 — Nginx production server
#
# NGINX_CONF build arg controls which nginx config is used:
#   "nginx.conf"        → Render / standalone (no backend proxy)
#   "nginx.docker.conf" → Docker Compose (proxies /api/ to backend)
# ─────────────────────────────────────────────────────────────
FROM nginx:1.27-alpine AS runtime

ARG NGINX_CONF=nginx.conf

# Remove default config
RUN rm /etc/nginx/conf.d/default.conf

# Copy the selected nginx config
COPY ${NGINX_CONF} /etc/nginx/conf.d/default.conf

# Copy built React app
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
