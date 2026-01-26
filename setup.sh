#!/bin/bash
echo "Setup Start..."

cp .env.example .env
composer install
npm install
php artisan key:generate
touch database/database.sqlite
php artisan migrate:fresh --seed
git branch -m dev
git remote remove origin

echo "Setup Complete"
