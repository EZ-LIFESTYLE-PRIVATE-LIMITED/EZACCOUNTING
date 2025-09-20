# frontend/Dockerfile
# Note: This Dockerfile is for development/testing purposes only
# Electron apps are typically distributed as standalone executables
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build TypeScript app
RUN npm run build

# For development: start the Electron app
# For production: you would build and distribute the Electron app separately
CMD ["npm", "run", "start:dev"]
