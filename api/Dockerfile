# Build the Node.js backend
FROM node:18 AS build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY api/package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app
COPY api/. .

# Build the TypeScript code
RUN npm run build


# Use Nginx as the runtime environment
FROM nginx:alpine

# # Remove default Nginx configuration
# RUN rm /etc/nginx/conf.d/default.conf

# # Copy custom Nginx configuration
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Remove default nginx configuration
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx configuration
COPY api/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built Node.js app
COPY --from=build /app /app

# Set environment variables for Node.js backend
ENV OPENAI_API_KEY=${OPENAI_API_KEY}
ENV REMOVE_BG_API_KEY=${REMOVE_BG_API_KEY}
ENV DATABASE_URL=${DATABASE_URL}
ENV JWT_SECRET=${JWT_SECRET}
ENV WEATHER_API_KEY=${WEATHER_API_KEY}
ENV SPACES_ENDPOINT=${SPACES_ENDPOINT}
ENV DIGITAL_OCEAN_ACCESS_KEY=${DIGITAL_OCEAN_ACCESS_KEY}
ENV DIGITAL_OCEAN_SECRET_KEY=${DIGITAL_OCEAN_SECRET_KEY}

# Expose the port for Nginx
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
