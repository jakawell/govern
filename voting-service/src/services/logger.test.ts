import { Console, File } from 'winston/lib/winston/transports';
import { Config } from './config';
import { AppLogger } from './logger';

describe('Service: Logger', () => {
  function configFactory(overrides: Partial<Config> = {}): Config {
    return {
      environment: 'development',
      logLevel: 'debug',
      appPort: 4001,
      publicKey: 'public',
      privateKey: 'secret',
      databaseConfig: {
        server: 'sqldata',
        port: 1433,
        user: 'test',
        password: 'test',
      },
      ...overrides,
    };
  }

  it('creates logger for local development', () => {
    // arrange
    const logger = AppLogger.getInstance(configFactory({
      environment: 'development',
      logLevel: 'debug',
    }));

    // act
    logger.info('Test log');

    // assert
    expect(logger.level).toEqual('debug');
    expect(logger.transports.length).toEqual(1);
    expect(logger.transports[0]).toBeInstanceOf(Console);
  });

  it('creates logger for deployed environment', () => {
    // arrange
    const logger = AppLogger.getInstance(configFactory({
      environment: 'production',
      logLevel: 'info',
    }));

    // act
    logger.info('Test log');

    // assert
    expect(logger.level).toEqual('info');
    expect(logger.transports.length).toEqual(2);
    expect(logger.transports[0]).toBeInstanceOf(File);
    expect(logger.transports[1]).toBeInstanceOf(File);
  });
});
