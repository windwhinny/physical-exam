import electron = require('electron');
const ipcMain = electron.ipcMain;
// tslint:disable-next-line:no-any
export default (service: any, serviceName: string) =>
  Object.getOwnPropertyNames(Object.getPrototypeOf(service))
  .forEach((name: keyof typeof service) => {
    const channel = `${serviceName}:${name}`;
    // tslint:disable-next-line:no-any
    ipcMain.on(channel, async (event: any, id: number, ...args: any[]) => {
      console.info('RECEIVE', serviceName, name, ...args);
      // tslint:disable-next-line:no-any
      args = args.map(arg => {
        if (Array.isArray(arg) && arg[0] === 'IPC-CALLBACK') {
          // tslint:disable-next-line:no-any
          return (...subargs: any[]) => {
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
        console.error('ERROR', e);
        if (e instanceof Error) {
          event.sender.send(`${serviceName}:${name}:reject`, id, {
            message: e.message,
          });
        } else {
          event.sender.send(`${serviceName}:${name}:reject`, id, e);
        }
        return;
      }
      event.sender.send(`${serviceName}:${name}:resolve`, id, result);
    });
  });
