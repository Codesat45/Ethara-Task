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
# ─────────────────────────────────────────────────────────────
FROM nginx:1.27-alpine AS runtime

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy our custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built React app
COPY --from=builder /app/dist /usr/share/nginx/html

# Non-root: nginx master runs as root to bind port 80,
# but worker processes run as nginx user (default alpine behaviour)
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
