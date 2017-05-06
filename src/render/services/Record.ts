import electron = require('electron');
import {
  RecordService
} from '../../constants';
let increamId = 0;
const ipcRenderer = electron.ipcRenderer;

// tslint:disable:no-any
export default <
  T extends RecordService,
  K extends keyof RecordService
>(name: K): T[K] => {
  let id = increamId++;
  return ((...args: any[]) => {
    return new Promise((resolve, reject) => {
      const callbacks: Function[] = [];
      const label = `${name}-${id}`;
      console.time(label);
      const clear = () => {
        console.timeEnd(label);
        ipcRenderer.removeListener(`RecordService:${name}:resolve`, onResolve);
        ipcRenderer.removeListener(`RecordService:${name}:reject`, onReject);
        ipcRenderer.removeListener(`RecordService:${name}:callback`, onCallback);
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
      console.info('SEND', name, ...args);
      ipcRenderer.send(`RecordService:${name}`, id, ...args);
      ipcRenderer.on(`RecordService:${name}:resolve`, onResolve);
      ipcRenderer.on(`RecordService:${name}:reject`, onReject);
      ipcRenderer.on(`RecordService:${name}:callback`, onCallback);
    })
  }) as any;
};
