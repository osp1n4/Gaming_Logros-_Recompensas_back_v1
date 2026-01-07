#!/bin/bash

# RabbitMQ Initialization Script
# Sets up exchanges, queues, and bindings

set -e

echo "Waiting for RabbitMQ to be ready..."
sleep 10

echo "Setting up RabbitMQ exchanges, queues, and bindings..."

# Player Service Exchanges
rabbitmqctl declare_exchange -p / player_events topic durable=true

# Achievement Service Exchanges
rabbitmqctl declare_exchange -p / achievement_events topic durable=true

# Queues
rabbitmqctl declare_queue -p / player_events durable=true
rabbitmqctl declare_queue -p / achievement_events durable=true
rabbitmqctl declare_queue -p / reward_events durable=true

# Bindings
rabbitmqctl bind_queue player_events player_events '#'
rabbitmqctl bind_queue achievement_events achievement_events '#'

echo "RabbitMQ setup completed!"
