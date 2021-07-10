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

  public static async insert<T extends ModelSchema>(
    records: Array<T>,
    table: string,
    options?: ModelOptions,
  ): Promise<number> {
    if (records.length === 0) {
      return 0;
    }
    const pool = options?.customPool ?? await DataConnection.getInstance();
    this.sanitize(table);
    const keys = this.sanitizeKeys(Object.keys(records[0]));
    const request = pool.request();
    const command = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${
      records.map((_record, i) => keys.map((key) => `@${key}_${i}`).join(', ')).join('), (')
    });`;
    records.forEach((record, i) => {
      keys.forEach((key) => {
        request.input(`${key}_${i}`, record[key]);
      });
    });
    const result = await request.query(command);
    return result.rowsAffected[0];
  }

  public static async create<T extends ModelSchema>(
    record: T,
    table: string,
    options?: ModelOptions,
  ): Promise<boolean> {
    return (await this.insert([record], table, options)) === 1;
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
