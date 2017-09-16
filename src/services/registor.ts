import electron = require('electron');
import Logger from './Logger';
const ipcMain = electron.ipcMain;
// tslint:disable-next-line:no-any
export default (service: any, serviceName: string) =>
  Object.getOwnPropertyNames(Object.getPrototypeOf(service))
  .forEach((name: keyof typeof service) => {
    const channel = `${serviceName}:${name}`;
    // tslint:disable-next-line:no-any
    ipcMain.on(channel, async (event: any, id: number, ...args: any[]) => {
      Logger.info('Registor RECEIVE', serviceName, name, ...args);
      // tslint:disable-next-line:no-any
      args = args.map(arg => {
        if (Array.isArray(arg) && arg[0] === 'IPC-CALLBACK') {
          // tslint:disable-next-line:no-any
          return (...subargs: any[]) => {
            Logger.log('Registor CALLBACK:', serviceName, name, arg[1], result);
            event.sender.send(`${serviceName}:${name}:callback`, id, arg[1], subargs);
          };
        }
        return arg;
      });
      // tslint:disable-next-line:no-any
      let result: any;
      try {
        result = await service[name].apply(service, args);
      } catch (e) {
        Logger.error('Registor ERROR', e);
        if (e instanceof Error) {
          event.sender.send(`${serviceName}:${name}:reject`, id, {
            message: e.message,
          });
        } else {
          event.sender.send(`${serviceName}:${name}:reject`, id, e);
        }
        return;
      }
      Logger.log('Registor RESOLVE:', serviceName, name, result);
      event.sender.send(`${serviceName}:${name}:resolve`, id, result);
    });
  });
