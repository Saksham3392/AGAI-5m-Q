# Lightweight high-performance Alpine Nginx base image
FROM nginx:alpine

# Set working directory
WORKDIR /usr/share/nginx/html

# Remove default nginx static assets
RUN rm -rf ./*

# Copy project assets
COPY . /usr/share/nginx/html/

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Clean up non-web assets from webroot
RUN rm -f Dockerfile .dockerignore nginx.conf render.yaml README.md

# Render automatically provides $PORT (defaults to 80 if not set)
EXPOSE 80 10000

# Dynamically substitute $PORT for Render compatibility and start Nginx
CMD sh -c "sed -i 's/listen 80;/listen '\${PORT:-80}';/g' /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"
