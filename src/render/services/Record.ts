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
      const label = `${name}-${id}`;
      console.time(label);
      const clear = () => {
        console.timeEnd(label);
        ipcRenderer.removeListener(`RecordService:${name}:resolve`, onResolve);
        ipcRenderer.removeListener(`RecordService:${name}:reject`, onReject);
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
      console.info('SEND', name, ...args);
      ipcRenderer.send(`RecordService:${name}`, id, ...args);
      ipcRenderer.on(`RecordService:${name}:resolve`, onResolve);
      ipcRenderer.on(`RecordService:${name}:reject`, onReject);
    })
  }) as any;
};
