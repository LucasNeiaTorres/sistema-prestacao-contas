# Stage 1: Build the Angular application
FROM node:18.18.0-alpine as build

WORKDIR /app

# Install Angular CLI
RUN npm install -g @angular/cli@16

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the source code and build the Angular application
COPY . .
RUN ng analytics off
RUN ng build --configuration production

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

# Copy the build output from the previous stage
COPY --from=build /app/dist/curatela /usr/share/nginx/html

# Copy the Nginx configuration file
COPY ./docker/production/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
