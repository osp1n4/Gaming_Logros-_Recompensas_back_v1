#!/bin/bash

# PostgreSQL Initialization Script
# Creates databases and initial schema

set -e

echo "Creating PostgreSQL databases..."

psql -U postgres <<-EOSQL
  CREATE DATABASE player_db;
  CREATE DATABASE achievement_db;
  CREATE DATABASE reward_db;
  
  CREATE USER player_user WITH PASSWORD 'player_password';
  GRANT ALL PRIVILEGES ON DATABASE player_db TO player_user;
  
  CREATE USER achievement_user WITH PASSWORD 'achievement_password';
  GRANT ALL PRIVILEGES ON DATABASE achievement_db TO achievement_user;
  
  CREATE USER reward_user WITH PASSWORD 'reward_password';
  GRANT ALL PRIVILEGES ON DATABASE reward_db TO reward_user;
EOSQL

echo "PostgreSQL databases created!"
