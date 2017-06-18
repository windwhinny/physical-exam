import electron = require('electron');
import path = require('path');
import child_process = require('child_process');
import serviceIPCRegistor from './registor';
import Iconv = require('iconv');
import {
  BluetoothService,
} from '../constants';
// tslint:disable-next-line:no-any
const cmd = path.join(electron.app.getAppPath(), 'bthcxn.exe');
// tslint:disable-next-line:no-any
const iconv = new (Iconv as any).Iconv('GBK', 'UTF-8');

export function sync(address: string, data: string): Promise<string> {
    return new Promise((resolve, reject) => {
      child_process.execFile(cmd, [
        `-a${address}`,
        `-d${data}`
      ], (error, stdout, stderr) => {
        if (error) return reject(error);
        if (stderr) return reject(new Error(stderr));
        resolve(stdout);
      });
    })
}

export class Bluetooth implements BluetoothService {
  listDevices(cb: (device: {name: string, address: string}) => void) {
    return new Promise((resolve, reject) => {
      const child = child_process.spawn(cmd);
      child.stdout.on('data', buffer => {
        let stdout = iconv.convert(buffer).toString() as string;
        stdout = stdout.replace('\r\n', '\n');
        const devices = stdout.split('\n');
        devices.forEach((str) => {
          const strs = str.split('#@$');
          const name = strs[0];
          if (!name) return;
          const address =  (strs[1] || '').replace(/[\(\)\r\n]/g, '');
          cb({name, address});
        });
      });
      child.on('close', (code: number) => {
        if (code !== 0) {
          reject(new Error('搜索失败'));
        } else {
          resolve();
        }
      });
    }) as Promise<void>;
  }
}

const bluetooth = new Bluetooth();
serviceIPCRegistor(bluetooth, 'BluetoothService');
export default bluetooth;
