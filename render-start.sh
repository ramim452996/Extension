#!/bin/sh

PORT="${PORT:-10000}"

echo "Starting Laravel on port ${PORT}..."

# Clear cached config and ensure sqlite exists
php artisan config:clear
php artisan migrate --force

# Serve directly on the Render-assigned port
exec php artisan serve --host=0.0.0.0 --port="${PORT}"
