# Player Service Documentation

## Overview
Microservice responsible for managing players and emitting game events.

## Responsibilities
- Register and manage players
- Receive game events (monster killed, time played, etc.)
- Validate events
- Publish events to RabbitMQ

## Structure
```
src/
├── controllers/     # HTTP endpoints
├── services/        # Business logic
├── repositories/    # Database access
├── entities/        # TypeORM entities
├── dtos/           # Data transfer objects
├── events/         # Event publishers
├── modules/        # NestJS modules
└── config/         # Configuration
```

## API Endpoints
- POST /players - Register a new player
- GET /players/:id - Get player details
- POST /players/:id/events - Publish a game event

## Events Emitted
- player.event.monster_killed
- player.event.time_played
- player.event.level_up
