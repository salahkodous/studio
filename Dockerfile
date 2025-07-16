# Dockerfile for a Next.js application

# Stage 1: Install dependencies
# --------------------------------
FROM node:20-alpine AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package.json and lock file
COPY package.json package-lock.json* ./
# Install dependencies
RUN npm install

# Stage 2: Build the application
# ------------------------------
FROM node:20-alpine AS builder
WORKDIR /app
# Copy dependencies from the previous stage
COPY --from=deps /app/node_modules ./node_modules
# Copy the rest of the application code
COPY . .

# Build the Next.js application
RUN npm run build

# Stage 3: Production image
# -------------------------
FROM node:20-alpine AS runner
WORKDIR /app

# Set environment variable to production
ENV NODE_ENV=production

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# The standalone output includes its own node_modules, so no need to install them again.

# Expose the port Next.js runs on
EXPOSE 3000

# Set the user to run the app
USER nextjs

# Command to start the server
CMD ["node", "server.js"]
