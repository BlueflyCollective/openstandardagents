# OSSA Website - Next.js Dev Server (for quick deployment)
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Start Next.js dev server (no build needed)
CMD ["npm", "run", "dev"]
