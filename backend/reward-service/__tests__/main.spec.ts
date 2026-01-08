import { Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

describe('Application Bootstrap (main.ts)', () => {
  it('should have main.ts file in src directory', () => {
    const mainPath = path.join(__dirname, '../src/main.ts');
    const exists = fs.existsSync(mainPath);

    expect(exists).toBe(true);
  });

  it('should import NestFactory', () => {
    const mainPath = path.join(__dirname, '../src/main.ts');
    const content = fs.readFileSync(mainPath, 'utf-8');

    expect(content).toContain('NestFactory');
  });

  it('should import RewardModule', () => {
    const mainPath = path.join(__dirname, '../src/main.ts');
    const content = fs.readFileSync(mainPath, 'utf-8');

    expect(content).toContain('RewardModule');
  });

  it('should have bootstrap function', () => {
    const mainPath = path.join(__dirname, '../src/main.ts');
    const content = fs.readFileSync(mainPath, 'utf-8');

    expect(content).toContain('bootstrap');
  });

  it('should call bootstrap function', () => {
    const mainPath = path.join(__dirname, '../src/main.ts');
    const content = fs.readFileSync(mainPath, 'utf-8');

    expect(content).toContain('bootstrap()');
  });
});
