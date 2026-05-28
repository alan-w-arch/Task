import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { Pool, QueryResult } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DbService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DbService.name);
  private pool: Pool;

  async onModuleInit() {
    const connectionString = process.env.DATABASE_URL;
    const dbHost = process.env.DB_HOST || 'localhost';
    const dbPort = parseInt(process.env.DB_PORT || '5432', 10);
    const dbUser = process.env.DB_USER || 'postgres';
    const dbPassword = process.env.DB_PASSWORD || 'postgres';
    const dbName = process.env.DB_NAME || 'scraper_db';
    const ssl = process.env.DB_SSL === 'true';

    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('DATABASE_URL value:', process.env.DATABASE_URL);

console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_NAME:', process.env.DB_NAME);

    const poolConfig = connectionString
      ? {
          connectionString,
          ssl: ssl ? { rejectUnauthorized: false } : false,
        }
      : {
          host: dbHost,
          port: dbPort,
          user: dbUser,
          password: dbPassword,
          database: dbName,
          ssl: ssl ? { rejectUnauthorized: false } : false,
        };

    this.logger.log(`Connecting to database at ${connectionString ? 'DATABASE_URL' : `${dbHost}:${dbPort}/${dbName}`}`);
    this.pool = new Pool(poolConfig);

    try {
      // Test the connection
      await this.pool.query('SELECT 1');
      this.logger.log('Database connection established successfully.');

      // Initialize the schema
      await this.initializeSchema();
    } catch (error) {
      this.logger.error('Failed to connect or initialize database schema:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    if (this.pool) {
      this.logger.log('Closing database connection pool...');
      await this.pool.end();
    }
  }

  /**
   * Run raw SQL queries
   */
  async query<T = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
    const start = Date.now();
    try {
      const res = await this.pool.query<T>(text, params);
      const duration = Date.now() - start;
      // Logging slow queries
      if (duration > 1000) {
        this.logger.warn(`Slow query: ${text} (${duration}ms)`);
      }
      return res;
    } catch (error) {
      this.logger.error(`Database query failed: ${text}`, error);
      throw error;
    }
  }

  /**
   * Acquire a transaction client
   */
  async getClient() {
    return await this.pool.connect();
  }

  private async initializeSchema() {
    try {
      // Find the schema.sql file
      // During development it's in src/db/schema.sql, but after build it might be in dist/db/schema.sql
      const pathsToTry = [
        path.join(__dirname, 'schema.sql'),
        path.join(__dirname, '..', 'db', 'schema.sql'),
        path.join(__dirname, '..', 'src', 'db', 'schema.sql'),
        path.join(process.cwd(), 'src', 'db', 'schema.sql'),
        path.join(process.cwd(), 'dist', 'db', 'schema.sql'),
      ];

      let schemaPath = '';
      for (const p of pathsToTry) {
        if (fs.existsSync(p)) {
          schemaPath = p;
          break;
        }
      }

      if (!schemaPath) {
        throw new Error('schema.sql file could not be located.');
      }

      this.logger.log(`Reading schema file from: ${schemaPath}`);
      const sql = fs.readFileSync(schemaPath, 'utf8');

      // Execute schema creation
      await this.pool.query(sql);
      this.logger.log('Database tables verified/created successfully.');
    } catch (error) {
      this.logger.error('Error during schema initialization:', error);
      throw error;
    }
  }
}
