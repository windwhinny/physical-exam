import electron = require('electron');
let increamId = 0;
const ipcRenderer: Electron.IpcRenderer | null = typeof electron !== 'undefined' ? electron.ipcRenderer : null;

export default (serviceName: string) => (name: string) => {
  let id = increamId++;
  // tslint:disable:no-any
  return ((...args: any[]) => {
    return new Promise((resolve, reject) => {
      const callbacks: Function[] = [];
      const label = `${name}-${id}`;
      console.time(label);
      const clear = () => {
        console.timeEnd(label);
        if (!ipcRenderer) return;
        ipcRenderer.removeListener(`${serviceName}:${name}:resolve`, onResolve);
        ipcRenderer.removeListener(`${serviceName}:${name}:reject`, onReject);
        ipcRenderer.removeListener(`${serviceName}:${name}:callback`, onCallback);
      }

      // tslint:disable-next-line:no-shadowed-variable
      const onCallback = (event: any, _id: number, index: number, args: any[]) => {
        console.info('CALLBACK', name, index, args);
        event;
        if (id !== _id) return;
        const cb = callbacks[index];
        if (cb) {
          cb.apply(null, args);
        }
      }

      const onResolve = (event: any, _id: number, result: any) => {
        console.info('RESOLVE', name, result);
        if (id !== _id) return;
        resolve(result);
        clear();
        event;
      }
      const onReject = (event: any, _id: number, err: any) => {
        console.error('REJECT', name, err);
        if (id !== _id) return;
        reject(err);
        clear();
        event;
      }
      args = args.map((arg) => {
        if (typeof arg !== 'function') return arg;
        const index = callbacks.push(arg) - 1;
        return ['IPC-CALLBACK', index];
      });
      if (!ipcRenderer) return;
      console.info('SEND', name, ...args);
      ipcRenderer.send(`${serviceName}:${name}`, id, ...args);
      ipcRenderer.on(`${serviceName}:${name}:resolve`, onResolve);
      ipcRenderer.on(`${serviceName}:${name}:reject`, onReject);
      ipcRenderer.on(`${serviceName}:${name}:callback`, onCallback);
    })
  }) as any;
}
