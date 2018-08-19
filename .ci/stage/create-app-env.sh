#!/usr/bin/env bash
echo "Creating stage APP .env file"
echo "DB_TYPE=db-mysql" >> .env
echo "DB_HOST=127.0.0.1" >> .env
echo "DB_USER=root" >> .env
echo "DB_PASSWORD=$DB_PASSWORD" >> .env
echo "DB_NAME=starter" >> .env
echo "HOSTNAME=http://pj.lpwebsite.com" >> .env
echo "NODE_ENV=stage" >> .env
echo "NODE_PORT=3000" >> .env
echo "SALT=$SALT" >> .env
echo "SITE_THEME=starter" >> .env
echo "TEST_PORT=3001" >> .env