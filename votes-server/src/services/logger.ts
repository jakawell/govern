import {
  Logger,
  createLogger,
  transports,
  format,
} from 'winston';
import { Config } from './config';

export class AppLogger {
  public static getInstance(
    config: Config,
  ): Logger {
    const logger = createLogger({
      level: config.logLevel,
    });

    if (config.environment !== 'production') {
      logger.add(new transports.Console({
        format: format.combine(
          format.colorize({
            level: true,
          }),
          format.printf((info) => {
            const now = new Date();
            return `${info.level}  (${now.toTimeString().substring(0, 8)}):\t${info.message}`;
          }),
        ),
      }));
    } else {
      logger.add(new transports.File({
        filename: 'logs/errors.json',
        maxsize: 50 * 1000,
        maxFiles: 10,
        tailable: true,
        zippedArchive: true,
        level: 'error',
        format: format.combine(
          format.timestamp(),
          format.ms(),
          format.json({
            space: 2,
          }),
        ),
      }));
      logger.add(new transports.File({
        filename: 'logs/app.json',
        maxsize: 50 * 1000,
        maxFiles: 10,
        tailable: true,
        zippedArchive: true,
        level: 'info',
        format: format.combine(
          format.timestamp(),
          format.ms(),
          format.json({
            space: 2,
          }),
        ),
      }));
    }
    return logger;
  }
}
