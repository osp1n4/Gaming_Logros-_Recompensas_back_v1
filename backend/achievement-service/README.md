# Achievement Service Documentation

## Overview
Microservice responsible for evaluating game events and unlocking achievements (Observer Pattern).

## Responsibilities
- Listen to player events from RabbitMQ
- Evaluate achievement rules
- Detect duplicates (prevent double unlock)
- Publish achievement unlocked events
- Persist achievements to database

## Structure
```
src/
├── controllers/     # HTTP endpoints for achievement queries
├── services/        # Business logic and evaluation
├── repositories/    # Database access
├── entities/        # TypeORM entities
├── dtos/           # Data transfer objects
├── listeners/      # Event listeners (Observer pattern)
├── rules/          # Achievement rule definitions
├── modules/        # NestJS modules
└── config/         # Configuration
```

## Events Consumed
- player.event.monster_killed
- player.event.time_played
- player.event.level_up

## Events Emitted
- achievement.unlocked

## Achievement Rules Engine
- Evaluates conditions based on event data
- Supports temporal windows and permanent achievements
- Prevents duplicate unlocks
