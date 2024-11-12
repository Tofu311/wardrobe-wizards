# Use an official Node runtime as a parent image
FROM node:18

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

# Expose the port the app runs on
EXPOSE 3000

# Start the app with environment variables
CMD ["sh", "-c", "OPENAI_API_KEY=$OPENAI_API_KEY REMOVE_BG_API_KEY=$REMOVE_BG_API_KEY DATABASE_URL=$DATABASE_URL JWT_SECRET=$JWT_SECRET WEATHER_API_KEY=$WEATHER_API_KEY SPACES_ENDPOINT=$SPACES_ENDPOINT DIGITAL_OCEAN_ACCESS_KEY=$DIGITAL_OCEAN_ACCESS_KEY DIGITAL_OCEAN_SECRET_KEY=$DIGITAL_OCEAN_SECRET_KEY npm start"]
