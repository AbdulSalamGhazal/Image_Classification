# Use Node.js LTS version
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY backend/package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the backend code
COPY backend/ .

# Create uploads directory
RUN mkdir -p uploads/saved

# Expose port 5001
EXPOSE 5001

# Start the server
CMD ["node", "server.js"] 