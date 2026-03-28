#!/usr/bin/env bash
# Salir si hay algún error
set -o errexit

echo "Instalando dependencias..."
pip install -r requirements.txt

echo "Recolectando archivos estáticos..."
python manage.py collectstatic --no-input

echo "Aplicando migraciones a la base de datos..."
python manage.py migrate
