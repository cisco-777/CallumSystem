# Use Node.js 20 slim (not alpine to avoid musl issues)
FROM node:20-slim

# Set working directory
WORKDIR /app

# Install OpenSSL for Prisma/database compatibility
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install dependencies including optional ones
RUN npm ci --include=optional

# Copy source files
COPY . .

# Build the application
RUN npm run build

# Expose port (Railway provides PORT env var)
EXPOSE ${PORT:-3000}

# Set production environment
ENV NODE_ENV=production

# Start the application
CMD ["npm", "run", "start"]
