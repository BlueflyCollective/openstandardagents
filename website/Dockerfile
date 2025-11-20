# OSSA Website - Next.js Dev Server (for quick deployment)
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Generate examples.json before starting
RUN npm run generate-examples || echo "Warning: Could not generate examples"

# Expose port
EXPOSE 3000

# Start Next.js dev server
CMD ["npm", "run", "dev"]
