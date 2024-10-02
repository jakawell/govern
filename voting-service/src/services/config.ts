import { config as MsSqlConfig } from 'mssql';

export interface Config {
  /**  The environment in which the application is running. */
  environment: string,

  /** The maximum level of log messages that should be logged. */
  logLevel: string,

  /** The port number on which the application should run. */
  appPort: number,

  /** The server's public key. */
  publicKey: string,

  /** The server's private key. */
  privateKey: string,

  /** The MS/Azure SQL connection configuration. */
  databaseConfig: MsSqlConfig,
}

export const AppConfig: Config = {
  environment: process.env.NODE_ENV ?? 'development',
  logLevel: process.env.LOG_LEVEL ?? 'debug',
  appPort: parseInt(process.env.API_APP_PORT ?? '4001', 10),
  publicKey: process.env.PUBLIC_KEY ?? 'public',
  privateKey: process.env.PRIVATE_KEY ?? 'secret',
  databaseConfig: {
    server: process.env.MSSQL_HOST ?? 'sqldata',
    port: parseInt(process.env.MSSQL_PORT ?? '1433', 10),
    user: process.env.MSSQL_USERNAME ?? 'sa',
    password: process.env.MSSQL_PASSWORD ?? 'Local_sa',
  },
};
