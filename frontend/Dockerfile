# Use an official Node runtime as a parent image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY frontend/package*.json ./
RUN npm install

# Copy the rest of the app
COPY frontend/. .

# Build the app
RUN npm run build

# Use nginx to serve the build folder
FROM nginx:alpine
COPY --from=0 /app/dist /usr/share/nginx/html

# Expose the port the app runs on
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
