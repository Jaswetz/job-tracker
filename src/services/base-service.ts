import { eq, like, or, desc } from "drizzle-orm";
import { getDatabase } from "../database/connection";
import type { SQLiteTable } from "drizzle-orm/sqlite-core";

/**
 * Base service class providing common CRUD operations
 * Reduces code duplication across service classes
 */
export abstract class BaseService<T, CreateInput, UpdateInput> {
  protected db = getDatabase();
  protected abstract table: SQLiteTable;
  protected abstract idColumn: any;

  protected generateId(): string {
    return crypto.randomUUID();
  }

  protected getCurrentTimestamp(): string {
    return new Date().toISOString();
  }

  async findById(id: string): Promise<T | null> {
    const result = await this.db.select().from(this.table).where(eq(this.idColumn, id)).limit(1);

    return (result[0] as T) || null;
  }

  async findAll(orderBy?: any): Promise<T[]> {
    const query = this.db.select().from(this.table);

    if (orderBy) {
      query.orderBy(orderBy);
    }

    return query.all() as T[];
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db.delete(this.table).where(eq(this.idColumn, id));

    return result.changes > 0;
  }

  protected async exists(id: string): Promise<boolean> {
    const result = await this.findById(id);
    return result !== null;
  }

  /**
   * Generic search method - override in subclasses for specific search logic
   */
  protected async searchFields(query: string, searchColumns: any[]): Promise<T[]> {
    const conditions = searchColumns.map((column) => like(column, `%${query}%`));

    return this.db
      .select()
      .from(this.table)
      .where(or(...conditions))
      .all() as T[];
  }
}
