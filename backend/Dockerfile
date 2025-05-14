# Use Node.js LTS version
FROM node:18-alpine

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Create uploads directory
RUN mkdir -p uploads/saved && chmod 777 uploads/saved

# Expose port
EXPOSE 5000

# Start the server
CMD ["npm", "run", "dev"] 