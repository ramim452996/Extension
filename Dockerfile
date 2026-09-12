FROM php:8.3-fpm-alpine

# Install system dependencies and PHP extensions
RUN apk add --no-cache \
    nginx \
    curl \
    git \
    libpng-dev \
    libxml2-dev \
    libzip-dev \
    zip \
    unzip \
    sqlite \
    sqlite-dev

RUN docker-php-ext-install pdo pdo_sqlite mbstring gd xml zip opcache

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copy application files
COPY . .

# Set permissions
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
RUN chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Install Composer dependencies
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Create database file if sqlite
RUN touch /var/www/html/database/database.sqlite \
    && chown www-data:www-data /var/www/html/database/database.sqlite \
    && chmod 775 /var/www/html/database/database.sqlite

# Nginx config
COPY render-nginx.conf /etc/nginx/nginx.conf

# Start script
COPY render-start.sh /render-start.sh
RUN chmod +x /render-start.sh

EXPOSE 80

CMD ["/render-start.sh"]
