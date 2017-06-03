import net = require('net');
import Iconv = require('iconv');
import electron = require('electron');
import path = require('path');
import child_process = require('child_process');
import {
  Student,
  Gender,
  CardReaderService,
} from '../constants';
import serviceIPCRegistor from './registor';

const bookcode = 685545396225;
// tslint:disable-next-line:no-any
const iconv = new (Iconv as any).Iconv('GBK', 'UTF-8');

function fetch (pin: string) {
  return new Promise((resolve, reject) => {
    const socket = net.connect({
      port: 8888,
      host: '127.0.0.1',
    });

    socket.setTimeout(2000);

    socket.on('data', d => {
      if (!socket.destroyed) {
        socket.destroy();
      }
      const data = iconv.convert(d);
      const strs = data.toString().split('|');
      if (strs[2].includes('失败')) {
        console.error(strs);
        return reject(new Error('读卡失败'));
      }
      strs[3];
      const student: Student = {
        name: strs[4],
        nu: strs[3],
        gender: strs[10] === '01' ? Gender.Male : Gender.Female,
      }

      resolve(student);
    });

    socket.on('error', reject);
    socket.write(`5001|1|${bookcode}|14|${pin}|3000000000|address|ff|`);
  }) as Promise<Student>;
}

export class CardReader implements CardReaderService {
  looping = false;
  cbs: Array<(student: Student) => void>;
  // tslint:disable-next-line:no-any
  timmer: any;
  child: child_process.ChildProcess | null = null;
  stopRead() {
    this.looping = false;
    this.cbs = [];
  }

  read(pin: string, cb: (student: Student) => void): Promise<void> {
    if (!this.child) {
      const cmd = path.join(electron.app.getAppPath(), 'sdk', 'SDK.exe');
      this.child = child_process.spawn(cmd);
    }
    return new Promise<void>((resolve) => {
      if (this.looping) {
        this.cbs.push(cb);
        return;
      }
      this.looping = true;
      this.cbs = [cb];
      const loop = () => {
        if (this.looping === false) return resolve();
        fetch(pin)
          .then((student) => {
            this.cbs.forEach(_cb => _cb(student));
          }, e => {
            console.error('ERROR', e.message);
          }).then(() => {
            if (this.looping === false) return resolve();
            setTimeout(loop, 1000);
          });
      };
      loop();
    })
  }
}

const cardReader = new CardReader();
serviceIPCRegistor(cardReader, 'CardReaderService');
export default cardReader;

export function destory() {
  cardReader.stopRead();
}
