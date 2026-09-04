FROM php:8.4-fpm-alpine

# Instalar dependências necessárias para compilação das extensões PHP
RUN apk add --no-cache \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    libzip-dev \
    icu-dev \
    oniguruma-dev \
    bash \
    mysql-client

# Configurar e instalar extensões PHP necessárias (pdo_mysql, gd, intl, zip, mbstring)
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
        pdo_mysql \
        gd \
        intl \
        zip \
        mbstring

# Utilizar a configuração padrão do PHP para produção
RUN mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"

# Ajustes de performance do PHP no php.ini
RUN echo "upload_max_filesize = 100M" >> "$PHP_INI_DIR/php.ini" \
    && echo "post_max_size = 100M" >> "$PHP_INI_DIR/php.ini" \
    && echo "memory_limit = 256M" >> "$PHP_INI_DIR/php.ini" \
    && echo "max_execution_time = 300" >> "$PHP_INI_DIR/php.ini"

# Configurar diretório de trabalho padrão
WORKDIR /var/www/html

EXPOSE 9000
CMD ["php-fpm"]
