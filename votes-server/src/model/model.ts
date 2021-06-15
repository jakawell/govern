import { ConnectionPool } from 'mssql';
import { DataConnection } from './dataConnection';

export type ModelSchema = {
  [key: string]: string | number | boolean | Date,
}

export type ModelOptions = {
  customPool?: ConnectionPool,
}

export class Model {
  private static readonly INPUT_ID = 'input';

  public static async create<T extends ModelSchema>(record: T, table: string, options?: ModelOptions): Promise<number> {
    const pool = options?.customPool ?? await DataConnection.getInstance();
    this.sanitize(table);
    const keys = this.sanitizeKeys(Object.keys(record));
    const request = pool.request();
    const command = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${
      keys.map((_k, i) => `@${this.INPUT_ID}${i}`).join(', ')
    });`;
    keys.forEach((key, i) => {
      request.input(`${this.INPUT_ID}${i}`, record[key]);
    });
    const result = await request.query(command);
    return result.rowsAffected[0];
  }

  /**
   * Database queries can only have keys that will not cause a SQL injection.
   * @param keys Keys of a database query.
   */
  private static sanitizeKeys(keys: Array<string>): Array<string> {
    keys.forEach((key) => {
      this.sanitize(key);
    });
    return keys;
  }

  private static sanitize(value: string): string {
    if (value.match(/^[a-zA-Z0-9_-]+$/)) {
      return value;
    }
    // throw an error, since this is a dangerous sign
    throw new Error('Database query included unsanitary value. This could be a sign of a security breach.');
  }
}
