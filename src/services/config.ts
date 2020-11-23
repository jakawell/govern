export interface Config {
  /**  The environment in which the application is running. */
  environment: string,

  /** The maximum level of log messages that should be logged. */
  logLevel: string,

  /** The port number on which the application should run. */
  appPort: number,
}

export const AppConfig: Config = {
  environment: process.env.NODE_ENV ?? 'development',
  logLevel: process.env.LOG_LEVEL ?? 'debug',
  appPort: parseInt(process.env.API_APP_PORT ?? '4001', 10),
};
