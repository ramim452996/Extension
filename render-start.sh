#!/bin/sh

# Generate key if not provided
php artisan config:clear
php artisan migrate --force

# Start PHP-FPM
php-fpm -D

# Start Nginx
nginx -g "daemon off;"
