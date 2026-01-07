#!/bin/bash

# Main Deployment Script
# Orchestrates the deployment of all services

set -e

echo "Starting Gaming - Logros y Recompensas Backend..."
echo "=================================================="

# Check if Docker/Podman is available
if ! command -v podman &> /dev/null && ! command -v docker &> /dev/null; then
    echo "Error: Docker or Podman is required but not installed."
    exit 1
fi

# Set container runtime
CONTAINER_RUNTIME="${CONTAINER_RUNTIME:-docker}"

# Build and start services
echo "Building services with ${CONTAINER_RUNTIME}..."
${CONTAINER_RUNTIME} compose -f docker-compose.yml build

echo "Starting services..."
${CONTAINER_RUNTIME} compose -f docker-compose.yml up -d

echo "Waiting for services to be ready..."
sleep 15

echo "Services started successfully!"
echo "=================================================="
echo "Services available at:"
echo "  Player Service:      http://localhost:3001"
echo "  Achievement Service: http://localhost:3002"
echo "  Reward Service:      http://localhost:3003"
echo "  RabbitMQ UI:        http://localhost:15672 (guest/guest)"
echo "=================================================="
