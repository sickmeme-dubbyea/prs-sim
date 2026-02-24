#!/bin/bash
# deploy.sh — Kudu deployment script for Azure App Service (Linux)
# This runs automatically when you push via Git or ZIP deploy.

set -e

echo "── PRS Stage Builder deployment ──"
echo "Python: $(python3 --version)"
echo "Pip:    $(pip3 --version)"

# Install dependencies into the App Service virtual environment
pip3 install --upgrade pip
pip3 install -r requirements.txt

echo "── Deployment complete ──"
