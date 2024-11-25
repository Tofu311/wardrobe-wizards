# Stage 1: Build the Node.js API
FROM node:18 AS build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json for installing dependencies
COPY api/package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY api/. .

# Build the TypeScript application
RUN npm run build

# Stage 2: Serve the API with Nginx
FROM nginx:alpine

# Set environment variables for the application
ENV OPENAI_API_KEY=${OPENAI_API_KEY}
ENV REMOVE_BG_API_KEY=${REMOVE_BG_API_KEY}
ENV DATABASE_URL=${DATABASE_URL}
ENV JWT_SECRET=${JWT_SECRET}
ENV WEATHER_API_KEY=${WEATHER_API_KEY}
ENV SPACES_ENDPOINT=${SPACES_ENDPOINT}
ENV DIGITAL_OCEAN_ACCESS_KEY=${DIGITAL_OCEAN_ACCESS_KEY}
ENV DIGITAL_OCEAN_SECRET_KEY=${DIGITAL_OCEAN_SECRET_KEY}

# Remove default Nginx configuration
RUN rm /etc/nginx/conf.d/default.conf

# Copy a custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built Node.js application to a specific directory
COPY --from=build /app/build /app

# Expose the Nginx port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
