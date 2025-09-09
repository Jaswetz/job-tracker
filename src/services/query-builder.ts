import { eq, and, or, like, desc, asc, gte, lte } from "drizzle-orm";
import type { SQLiteColumn } from "drizzle-orm/sqlite-core";

/**
 * Query builder utility for constructing complex database queries
 * Helps reduce code duplication and improves query performance
 */
export class QueryBuilder {
  private conditions: any[] = [];
  private orderByClause: any[] = [];
  private limitValue?: number;
  private offsetValue?: number;

  /**
   * Add equality condition
   */
  where(column: SQLiteColumn, value: any): this {
    this.conditions.push(eq(column, value));
    return this;
  }

  /**
   * Add LIKE condition for text search
   */
  whereLike(column: SQLiteColumn, value: string): this {
    this.conditions.push(like(column, `%${value}%`));
    return this;
  }

  /**
   * Add range condition (greater than or equal)
   */
  whereGte(column: SQLiteColumn, value: any): this {
    this.conditions.push(gte(column, value));
    return this;
  }

  /**
   * Add range condition (less than or equal)
   */
  whereLte(column: SQLiteColumn, value: any): this {
    this.conditions.push(lte(column, value));
    return this;
  }

  /**
   * Add OR condition for multiple values
   */
  whereIn(column: SQLiteColumn, values: any[]): this {
    if (values.length > 0) {
      this.conditions.push(or(...values.map((value) => eq(column, value))));
    }
    return this;
  }

  /**
   * Add text search across multiple columns
   */
  search(columns: SQLiteColumn[], query: string): this {
    if (query.trim()) {
      const searchConditions = columns.map((column) => like(column, `%${query}%`));
      this.conditions.push(or(...searchConditions));
    }
    return this;
  }

  /**
   * Add ordering
   */
  orderBy(column: SQLiteColumn, direction: "asc" | "desc" = "desc"): this {
    this.orderByClause.push(direction === "desc" ? desc(column) : asc(column));
    return this;
  }

  /**
   * Add limit
   */
  limit(count: number): this {
    this.limitValue = count;
    return this;
  }

  /**
   * Add offset
   */
  offset(count: number): this {
    this.offsetValue = count;
    return this;
  }

  /**
   * Get the WHERE clause
   */
  getWhereClause() {
    return this.conditions.length > 0 ? and(...this.conditions) : undefined;
  }

  /**
   * Get the ORDER BY clause
   */
  getOrderByClause() {
    return this.orderByClause;
  }

  /**
   * Get limit value
   */
  getLimit() {
    return this.limitValue;
  }

  /**
   * Get offset value
   */
  getOffset() {
    return this.offsetValue;
  }

  /**
   * Reset the builder
   */
  reset(): this {
    this.conditions = [];
    this.orderByClause = [];
    this.limitValue = undefined;
    this.offsetValue = undefined;
    return this;
  }
}
