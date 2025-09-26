import Database from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';

export interface Migration {
  version: number;
  name: string;
  sql: string;
}

export class MigrationRunner {
  private migrationsPath: string;

  constructor() {
    this.migrationsPath = __dirname;
  }

  /**
   * Run all pending migrations
   */
  public async runMigrations(db: Database.Database): Promise<void> {
    try {
      // Ensure migrations table exists
      await this.createMigrationsTable(db);
      
      // Get executed migrations
      const executedMigrations = this.getExecutedMigrations(db);
      
      // Get all migration files
      const migrationFiles = this.getMigrationFiles();
      
      // Run pending migrations
      for (const migration of migrationFiles) {
        if (!executedMigrations.has(migration.version)) {
          console.log(`Running migration: ${migration.name}`);
          await this.runMigration(db, migration);
        }
      }
      
      console.log('All migrations completed successfully');
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  }

  /**
   * Create migrations tracking table
   */
  private async createMigrationsTable(db: Database.Database): Promise<void> {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        version INTEGER NOT NULL UNIQUE,
        name TEXT NOT NULL,
        executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    db.exec(createTableSQL);
  }

  /**
   * Get list of executed migrations
   */
  private getExecutedMigrations(db: Database.Database): Set<number> {
    try {
      const stmt = db.prepare('SELECT version FROM migrations ORDER BY version');
      const rows = stmt.all() as Array<{ version: number }>;
      return new Set(rows.map(row => row.version));
    } catch (error) {
      // Table might not exist yet, return empty set
      return new Set();
    }
  }

  /**
   * Get all migration files
   */
  private getMigrationFiles(): Migration[] {
    const migrations: Migration[] = [];
    
    try {
      const files = fs.readdirSync(this.migrationsPath)
        .filter(file => file.endsWith('.sql'))
        .sort();
      
      for (const file of files) {
        const version = parseInt(file.split('_')[0]);
        const name = file.replace('.sql', '');
        const sqlPath = path.join(this.migrationsPath, file);
        const sql = fs.readFileSync(sqlPath, 'utf8');
        
        migrations.push({ version, name, sql });
      }
    } catch (error) {
      console.error('Error reading migration files:', error);
    }
    
    return migrations;
  }

  /**
   * Run a single migration
   */
  private async runMigration(db: Database.Database, migration: Migration): Promise<void> {
    const transaction = db.transaction(() => {
      // Execute migration SQL
      db.exec(migration.sql);
      
      // Record migration execution
      const stmt = db.prepare(`
        INSERT OR IGNORE INTO migrations (version, name, executed_at) 
        VALUES (?, ?, CURRENT_TIMESTAMP)
      `);
      stmt.run(migration.version, migration.name);
    });
    
    transaction();
    console.log(`Migration ${migration.name} completed successfully`);
  }

  /**
   * Get migration status
   */
  public getMigrationStatus(db: Database.Database): Array<{ version: number; name: string; executed_at: string }> {
    try {
      const stmt = db.prepare('SELECT version, name, executed_at FROM migrations ORDER BY version');
      return stmt.all() as Array<{ version: number; name: string; executed_at: string }>;
    } catch (error) {
      return [];
    }
  }
}
