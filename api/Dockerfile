# Use an official Node runtime as a parent image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY api/package*.json ./
RUN npm install

# Copy the rest of the app
COPY api/. .

# Build the TypeScript code
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Start the app
CMD ["npm", "start"]