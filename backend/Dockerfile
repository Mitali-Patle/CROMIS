# Use Node.js LTS
FROM node:20-alpine

# Set backend working directory
WORKDIR /app

# Copy only package.json first
COPY package.json .

# Install dependencies
RUN npm install --production

# Copy backend code
COPY . .

# Expose backend port
EXPOSE 5000

# Start backend server directly (no npm)
CMD ["node", "server.js"]