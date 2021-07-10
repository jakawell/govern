import { ConnectionPool, config as MsSqlConfig } from 'mssql';
import { AppConfig, Config } from '../services';

export class DataConnection extends ConnectionPool {
  private static instance: DataConnection | null;

  private constructor(config: MsSqlConfig) {
    super(config);
  }

  public static async getInstance(config: Config = AppConfig): Promise<DataConnection> {
    if (DataConnection.instance) {
      return DataConnection.instance;
    }
    DataConnection.instance = new DataConnection(config.databaseConfig);
    await DataConnection.instance.connect();
    return DataConnection.instance;
  }

  public static async teardown(): Promise<void> {
    if (DataConnection.instance?.connected) {
      await DataConnection.instance.close();
    }
    DataConnection.instance = null;
  }
}
