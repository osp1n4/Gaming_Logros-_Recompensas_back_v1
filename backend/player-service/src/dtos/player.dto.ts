import { IsString, IsEmail, IsNotEmpty, MinLength, MaxLength, IsInt, Min, IsEnum } from 'class-validator';

/**
 * DTOs for Player Service
 * SOLID Principle I (Interface Segregation): Specific DTOs for different operations
 */

export class CreatePlayerDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  username: string;

  @IsNotEmpty()
  @IsEmail()
  @MaxLength(100)
  email: string;
}

export class UpdatePlayerDto {
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  username?: string;

  @IsEmail()
  @MaxLength(100)
  email?: string;
}

export class PlayerResponseDto {
  id: string;
  username: string;
  email: string;
  monstersKilled: number;
  timePlayed: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum GameEventType {
  MONSTER_KILLED = 'monster_killed',
  TIME_PLAYED = 'time_played'
}

export class GameEventDto {
  @IsNotEmpty()
  @IsString()
  playerId: string;

  @IsNotEmpty()
  @IsEnum(GameEventType)
  eventType: GameEventType;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  value: number;
}

