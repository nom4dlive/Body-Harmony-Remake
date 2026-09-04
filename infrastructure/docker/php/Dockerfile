FROM php:8.4-fpm-alpine

# Install system dependencies
RUN apk add --no-cache \
    freetype-dev \
    libjpeg-turbo-dev \
    libpng-dev \
    libzip-dev \
    zip \
    unzip \
    sqlite-dev \
    oniguruma-dev \
    icu-dev

# Install and configure PHP extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
        gd \
        pdo_mysql \
        pdo_sqlite \
        bcmath \
        intl \
        zip \
        mbstring

WORKDIR /var/www/html
