# Reward Service Documentation

## Overview
Microservice responsible for assigning rewards based on unlocked achievements.

## Responsibilities
- Listen to achievement unlocked events from RabbitMQ
- Apply reward strategies based on achievement type
- Assign rewards to players
- Persist rewards to database

## Structure
```
src/
├── controllers/     # HTTP endpoints for reward queries
├── services/        # Business logic and reward assignment
├── repositories/    # Database access
├── entities/        # TypeORM entities
├── dtos/           # Data transfer objects
├── listeners/      # Event listeners
├── strategies/     # Reward strategies (Strategy Pattern)
├── modules/        # NestJS modules
└── config/         # Configuration
```

## Events Consumed
- achievement.unlocked

## Reward Types
- Virtual Coins
- Items
- Experience Points
- Badges

## Reward Strategies
- DynamicRewardStrategy (based on achievement tier)
- FixedRewardStrategy (predefined amounts)
- BonusRewardStrategy (temporary bonuses)
