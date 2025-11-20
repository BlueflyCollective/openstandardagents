# OSSA Website - Next.js Dev Server (for quick deployment)
# Build from project root to access examples directory
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY website/package*.json ./website/
RUN cd website && npm install --legacy-peer-deps

# Copy examples directory (needed for generate-examples script)
COPY examples ./examples

# Copy website source code
COPY website ./website

WORKDIR /app/website

# Generate examples.json before starting
RUN npm run generate-examples || echo "Warning: Could not generate examples"

# Expose port
EXPOSE 3000

# Start Next.js dev server
CMD ["npm", "run", "dev"]
