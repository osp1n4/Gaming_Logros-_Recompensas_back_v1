# Configuración de PostgreSQL

## Instancias

### Player Service
- Host: postgres-player
- Port: 5433
- Database: player_db
- User: player_user
- Password: player_password

### Achievement Service
- Host: postgres-achievement
- Port: 5434
- Database: achievement_db
- User: achievement_user
- Password: achievement_password

### Reward Service
- Host: postgres-reward
- Port: 5435
- Database: reward_db
- User: reward_user
- Password: reward_password

## Conectarse desde el Host

```bash
psql -h localhost -p 5433 -U player_user -d player_db
psql -h localhost -p 5434 -U achievement_user -d achievement_db
psql -h localhost -p 5435 -U reward_user -d reward_db
```

## Migraciones

Cada servicio maneja sus migraciones de forma independiente usando TypeORM.
