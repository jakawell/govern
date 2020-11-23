import { Console, File } from 'winston/lib/winston/transports';
import { AppLogger } from './logger';

describe('Logger service', () => {
  it('creates logger for local development', () => {
    // arrange
    const logger = AppLogger.getInstance({
      environment: 'development',
      logLevel: 'debug',
      appPort: 4001,
    });

    // act
    logger.info('Test log');

    // assert
    expect(logger.level).toEqual('debug');
    expect(logger.transports.length).toEqual(1);
    expect(logger.transports[0]).toBeInstanceOf(Console);
  });

  it('creates logger for deployed environment', () => {
    // arrange
    const logger = AppLogger.getInstance({
      environment: 'production',
      logLevel: 'info',
      appPort: 4001,
    });

    // act
    logger.info('Test log');

    // assert
    expect(logger.level).toEqual('info');
    expect(logger.transports.length).toEqual(2);
    expect(logger.transports[0]).toBeInstanceOf(File);
    expect(logger.transports[1]).toBeInstanceOf(File);
  });
});
