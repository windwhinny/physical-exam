import electron = require('electron');
import path = require('path');
import child_process = require('child_process');
import serviceIPCRegistor from './registor';
import Iconv = require('iconv');
import Logger from './Logger';
import {
  BluetoothService,
} from '../constants';
// tslint:disable-next-line:no-any
const cmd = path.join(electron.app.getAppPath().replace(/[\\\/]resources[\\\/]app.asar/, ''), 'bthcxn.exe');
// tslint:disable-next-line:no-any
const iconv = new (Iconv as any).Iconv('GBK', 'UTF-8');

export class Bluetooth implements BluetoothService {
  process: child_process.ChildProcess | null = null;
  listDevices(cb: (device: {name: string, address: string}) => void) {
    return new Promise((resolve, reject) => {
      child_process.execFile(cmd, {
        encoding: 'buffer',
      }, (err, buffer, stderr) => {
        if (err) return reject(err);
        if (stderr && stderr.length) {
          Logger.error('ListDevices', stderr.toString());
          return reject(new Error('搜索设备出错'))
        }
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
        resolve();
      });
    }) as Promise<void>;
  }

  startProcess(address: string) {
    this.process = child_process.spawn(cmd, [
      `-a${address}`
    ]);
  }

  sync(address: string, data: string | null): Promise<string> {
    if (!this.process) {
      this.startProcess(address);
    }
    const cleanUp = () => {
      if (this.process) {
        this.process.stdout.removeAllListeners('data');
        this.process.stderr.removeAllListeners('data');
        this.process.removeAllListeners('error');
      }
    }
    return new Promise((resolve, reject) => {
      if (data == null) {
        data = 'end';
      }
      data = data.replace(/[\u007F-\uFFFF]/g, (chr: string) => {
        return '\\u' + ('0000' + chr.charCodeAt(0).toString(16)).substr(-4)
      })
      if (!this.process) return reject(new Error('同步失败'));
      this.process.stdin.write(data + '\n', () => {
        if (data === 'end' && this.process) {
          this.process.kill();
          this.process = null;
          resolve('end');
        }
      });
      const onData = (stdout: Buffer) => {
        Logger.log('sync onData', stdout.toString());
        try {
          const resp = JSON.parse(stdout.toString())
          if (resp.status !== 1) {
            reject(new Error(resp.info));
          } else {
            resolve(stdout);
          }
        } catch (e) {
          return reject(e);
        }
      };
      const onError = (e: Error | Buffer) => {
        Logger.error('sync', e);
        if (e instanceof Buffer) {
          Logger.error('sync', e.toString());
        } else {
          Logger.error('sync', e);
        }
        reject(new Error('上传失败'));
      };
      this.process.stdout.once('data', onData);
      this.process.stderr.once('data', onError);
      this.process.once('error', onError);
    })
    .then((ret: string) => {
      cleanUp();
      return ret;
    }, (err: Error) => {
      cleanUp();
      if (this.process) {
        this.process.kill();
      }
      this.process = null;
      throw err;
    });
  }
}

const bluetooth = new Bluetooth();
serviceIPCRegistor(bluetooth, 'BluetoothService');
export default bluetooth;
