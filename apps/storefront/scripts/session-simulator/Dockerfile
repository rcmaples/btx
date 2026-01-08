# BTX Session Simulator Container
# Runs Playwright-based browser automation for simulating user sessions

# Use Microsoft's Playwright image with all browsers and dependencies pre-installed
# This matches the project's Playwright version (1.57.0)
FROM mcr.microsoft.com/playwright:v1.57.0-noble

# Set working directory
WORKDIR /app

# Install pnpm globally (matches project version)
RUN corepack enable && corepack prepare pnpm@10.26.2 --activate

# Copy package files for dependency installation
# Using the standalone container package.json (not the full monorepo)
COPY scripts/session-simulator/container-package.json ./package.json

# Install dependencies
RUN pnpm install --frozen-lockfile=false

# Copy the simulator scripts
COPY scripts/session-simulator/*.ts ./scripts/session-simulator/
COPY scripts/session-simulator/*.sh ./scripts/session-simulator/

# Make entry point executable
RUN chmod +x ./scripts/session-simulator/docker-entrypoint.sh

# Set environment variables
ENV NODE_ENV=production
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

# Entry point
ENTRYPOINT ["./scripts/session-simulator/docker-entrypoint.sh"]
