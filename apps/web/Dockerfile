# Frontend Dockerfile - Next.js (apps/web)
FROM node:20-alpine AS base
WORKDIR /app

# Install deps (separate stage for caching)
COPY apps/web/package.json apps/web/package-lock.json ./apps/web/
WORKDIR /app/apps/web
RUN npm ci --silent

# Copy source and build
COPY apps/web/ .
RUN npm run build

# Production image
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=base /app/apps/web/.next ./.next
COPY --from=base /app/apps/web/public ./public
COPY --from=base /app/apps/web/package.json ./package.json

# Install a lightweight server if needed (next start uses node)
RUN npm ci --only=production --silent || true

EXPOSE 3000
CMD ["npm", "--prefix", "apps/web", "run", "start"]
