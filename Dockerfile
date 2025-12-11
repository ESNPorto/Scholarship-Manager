# Stage 1: Build the React Application
FROM node:20-alpine as build

WORKDIR /app

# Copy package files and install dependencies
COPY package.json ./
RUN npm install

# Copy the rest of the app source code
COPY . .

# Build the app for production (Vite)
RUN npm run build

# Stage 2: Serve the App using Nginx
FROM nginx:alpine

# Copy the build output from Stage 1 to the Nginx html directory
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80 (Internal container port)
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]