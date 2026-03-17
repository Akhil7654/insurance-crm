#!/bin/sh
export PYTHONPATH=/app/backend/packages
python3 manage.py migrate
python3 -m gunicorn config.wsgi:application --bind 0.0.0.0:8080 --workers 1 --threads 2 --timeout 120