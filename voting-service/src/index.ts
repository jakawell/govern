import process from 'process';
import { VoterServiceApp } from './api/app';
import { DataConnection } from './model';
import { AppConfig, AppLogger } from './services';

// *************************************************************** //
// **************************   IMPORTANT   ********************** //
// **** This index file MUST ONLY contain basic instantiation **** //
// **** of injectables and startup of the apps. NO function   **** //
// **** calls other than those two purposes.                  **** //
// *************************************************************** //
// *************************************************************** //

const apiAppPort = AppConfig.appPort;
const logger = AppLogger.getInstance(AppConfig);
const apiApp = new VoterServiceApp(apiAppPort);

DataConnection
  .getInstance(AppConfig)
  .then(() => {
    const server = apiApp.start(() => {
      logger.info(`Application running on port ${apiAppPort}`);
    });

    process.on('SIGTERM', () => {
      logger.info('Gracefully shutting down application due to SIGTERM...');
      server.close(async () => {
        logger.info('Gracefully shut down app server.');
        logger.info('Disconnecting from data source...');
        try {
          await DataConnection.teardown();
        } catch (error: unknown) {
          logger.error(`Failed to disconnect from data source: ${error instanceof Error ? error.message : error}`);
        }
        logger.info('Disconnected from database.');

        logger.info('Finished shutting down application.');
      });
    });
  })
  .catch((err: unknown) => {
    logger.error(`Failed to connect to data source, which means server startup was aborted: ${
      err instanceof Error ? err.message : err
    }`);
  });
