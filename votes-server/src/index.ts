/* eslint-disable import/first */
global.navigator = { appName: 'nodejs' } as never; // fake the navigator object for jsencrypt
global.window = {} as never; // fake the window object for jsencrypt

import { ApiApplication } from './api/app';
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
const apiApp = new ApiApplication(apiAppPort);

apiApp.start(() => {
  logger.info(`Application running on port ${apiAppPort}`);
});
