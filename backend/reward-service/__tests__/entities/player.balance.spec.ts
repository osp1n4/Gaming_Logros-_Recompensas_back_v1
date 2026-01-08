import { PlayerBalance } from '../../src/entities/player.balance';

describe('PlayerBalance Entity', () => {
  it('should create instance with default values', () => {
    const balance = new PlayerBalance();
    balance.playerId = 'test-player-id';

    expect(balance.playerId).toBe('test-player-id');
    expect(balance.totalCoins).toBe(0);
    expect(balance.totalPoints).toBe(0);
  });

  it('should allow setting custom values', () => {
    const balance = new PlayerBalance();
    balance.playerId = 'test-player';
    balance.totalCoins = 100;
    balance.totalPoints = 50;

    expect(balance.totalCoins).toBe(100);
    expect(balance.totalPoints).toBe(50);
  });
});
