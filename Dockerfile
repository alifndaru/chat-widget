# =============================================================================
# Stage 1: Development Dependencies
# =============================================================================
# Use Node.js 22 Alpine for smaller image size and faster builds
FROM node:22-alpine AS dependencies

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --silent && npm cache clean --force

# =============================================================================
# Stage 2: Application Builder
# =============================================================================
# Use the same Node.js image for consistency
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./

# Copy installed dependencies from previous stage
COPY --from=dependencies /app/node_modules ./node_modules

# Copy source code and configuration files
COPY src ./src
COPY public ./public
COPY index.html ./
COPY vite.config.ts tsconfig*.json ./
COPY tailwind.config.ts* ./
COPY .env* ./

# Set production environment for optimized build
ENV NODE_ENV=production

# Build the application with Vite
# This creates optimized, minified production assets
RUN npx vite build

# Note: Vite automatically copies /public/index.html to /dist/index.html during build
# No need to copy root index.html (which is for dev mode only)

# =============================================================================
# Stage 3: Production Server
# =============================================================================
# Use Nginx Alpine for smaller production image
FROM nginx:stable-alpine AS production

# Install additional tools for health checks
RUN apk add --no-cache curl

# First, copy public static assets (HTML files, demos, etc) - this goes first as base layer
COPY --from=builder /app/public /usr/share/nginx/html

# Then, copy built application assets from builder stage - this overwrites public files with build output
# This ensures chat-widget.js and chat-widget.css from build take precedence
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 for web traffic
EXPOSE 80

# Health check to ensure the application is running properly
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:80/health || exit 1

# Start Nginx in foreground mode (required for Docker containers)
CMD ["nginx", "-g", "daemon off;"]
