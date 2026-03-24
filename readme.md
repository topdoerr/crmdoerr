# CRM Platform - Levantar en local

Guia para clonar el repo y correr una copia local similar a produccion.

## 1. Requisitos

* PHP `8.1.x` recomendado (probado: `8.1.2`, mismo entorno que prod).
* Composer `2.x`.
* Node.js + npm (el repo usa `package-lock` v3).
* Base de datos MySQL/MariaDB con backup de datos.
* Extensiones PHP requeridas:
  * `bcmath`, `ctype`, `curl`, `dom`, `filter`, `hash`, `imap`, `json`, `libxml`, `openssl`, `xmlwriter`
  * `mysqli`, `pdo_mysql`
  * `mbstring` (o polyfill; recomendado tener la extension activa)

Si te falta una extension, habilitala en `php.ini` (ejemplo):
    extension=mysqli
    extension=pdo_mysql
    extension=imap
    extension=mbstring

## 2. Clonar e instalar dependencias

Desde la raiz del proyecto:
    git clone <repo-url>
    cd crm_platform
    npm install

Instalar dependencias PHP dentro de `application`:
    cd application
    composer install
    cd ..

Importante: `composer install` no va en la raiz porque el `composer.json` esta en `application/`.

## 3. Configurar app local

(No olvides crear la abse de datos y utilizar el database.sql en la raiz del proyecto para crear las tablas requeridas)

1. Copiar `application/config/app-config-sample.php` como `application/config/app-config.php`.
2. Completar en `app-config.php`:
   * `APP_BASE_URL` (ejemplo: `http://localhost:8000/`)
   * `APP_DB_HOSTNAME`
   * `APP_DB_USERNAME`
   * `APP_DB_PASSWORD`
   * `APP_DB_NAME`
3. Verificar que la DB exista y sea accesible.

## 4. Poner entorno en desarrollo

En `index.php` cambiar:
    define('ENVIRONMENT', 'production');

por:
    define('ENVIRONMENT', 'development');

## 5. Compilar assets front

Compilacion local:
    npm run development

Compilacion de produccion (si la necesitas):
    npm run build

## 6. Levantar servidor local

Comando recomendado:
    php -S localhost:8000 -t .

Tambien puedes usar:
    npm run up

Abrir en navegador: `http://localhost:8000/`

## 7. Flujo rapido (todo en uno)

El script `npm run dev` hace:

1. `npm run development`

2. `composer i` dentro de `application`

3. Levanta servidor local
    npm run dev

## 8. Problemas comunes (basado en pruebas reales)

* CSS no carga:
  * Usa `php -S localhost:8000 -t .` (no `php -S 127.0.0.1:8000 index.php`).
  * Ejecuta `npm run development`.
* Error de Composer:
  * Ejecuta `composer install` dentro de `application/`.
* Error por extension PHP faltante:
  * Activar extension en `php.ini` y reiniciar terminal/servidor.
* Error por version de DB:
  * Validar compatibilidad de version MySQL/MariaDB con el dump/prod.
