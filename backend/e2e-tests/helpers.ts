import axios, { AxiosInstance } from 'axios';
import * as amqp from 'amqplib';
import { Pool } from 'pg';
import { E2E_CONFIG } from './config';

/**
 * Helper utilities for E2E tests
 * Utilidades compartidas para tests de integración
 */

// API Client Helper
export class ApiClient {
  private client: AxiosInstance;

  constructor(baseUrl: string) {
    this.client = axios.create({
      baseURL: baseUrl,
      timeout: E2E_CONFIG.timeouts.apiCall,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async get<T>(url: string): Promise<T> {
    const response = await this.client.get<T>(url);
    return response.data;
  }

  async post<T>(url: string, data: any): Promise<T> {
    const response = await this.client.post<T>(url, data);
    return response.data;
  }

  async put<T>(url: string, data: any): Promise<T> {
    const response = await this.client.put<T>(url, data);
    return response.data;
  }

  async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete<T>(url);
    return response.data;
  }
}

// RabbitMQ Helper  
export class RabbitMQHelper {
  private connection: any = null;
  private channel: any = null;

  async connect(): Promise<void> {
    this.connection = await amqp.connect(E2E_CONFIG.rabbitmq.url);
    this.channel = await this.connection.createChannel();
  }

  async disconnect(): Promise<void> {
    if (this.channel) {
      await this.channel.close().catch(() => {});
    }
    if (this.connection) {
      await this.connection.close().catch(() => {});
    }
    this.channel = null;
    this.connection = null;
  }

  async publishEvent(exchange: string, routingKey: string, data: any): Promise<void> {
    if (!this.channel) throw new Error('RabbitMQ channel not initialized');
    
    await this.channel.assertExchange(exchange, 'topic', { durable: true });
    this.channel.publish(
      exchange,
      routingKey,
      Buffer.from(JSON.stringify(data)),
      { persistent: true }
    );
  }

  async consumeEvent(queue: string, timeout: number = 10000): Promise<any> {
    if (!this.channel) throw new Error('RabbitMQ channel not initialized');

    await this.channel.assertQueue(queue, { durable: true });

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Timeout waiting for message in queue: ${queue}`));
      }, timeout);

      this.channel!.consume(
        queue,
        (msg: any) => {
          if (msg) {
            clearTimeout(timeoutId);
            const data = JSON.parse(msg.content.toString());
            this.channel!.ack(msg);
            resolve(data);
          }
        },
        { noAck: false }
      );
    });
  }

  async purgeQueue(queue: string): Promise<void> {
    if (!this.channel) throw new Error('RabbitMQ channel not initialized');
    try {
      await this.channel.assertQueue(queue, { durable: true });
      await this.channel.purgeQueue(queue);
    } catch (error) {
      // Queue might not exist yet, ignore error
      console.log(`Queue ${queue} doesn't exist yet, skipping purge`);
    }
  }
}

// Database Helper
export class DatabaseHelper {
  private pool: Pool;

  constructor(config: any) {
    this.pool = new Pool(config);
  }

  async query(sql: string, params: any[] = []): Promise<any> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(sql, params);
      return result.rows;
    } finally {
      client.release();
    }
  }

  async disconnect(): Promise<void> {
    await this.pool.end();
  }
}

// Retry Helper
export async function retryAsync<T>(
  fn: () => Promise<T>,
  maxAttempts: number = E2E_CONFIG.retries.maxAttempts,
  delayMs: number = E2E_CONFIG.retries.delayMs
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxAttempts) {
        await sleep(delayMs);
      }
    }
  }

  throw new Error(`Failed after ${maxAttempts} attempts: ${lastError!.message}`);
}

// Sleep Helper
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Wait for condition Helper
export async function waitForCondition(
  condition: () => Promise<boolean>,
  timeoutMs: number = 10000,
  intervalMs: number = 500
): Promise<void> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {
    if (await condition()) {
      return;
    }
    await sleep(intervalMs);
  }

  throw new Error('Condition not met within timeout');
}
