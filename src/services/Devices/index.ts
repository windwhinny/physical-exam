import SerialPort = require('serialport');
import Event = require('events');
import {
  listPorts,
  makeFrame,
  receiveFrame,
  Frame,
  asciiToString,
} from './utils';
import {
  TestType,
  TestCode,
} from '../../constants';

enum ScoreType {
  RealTime,
  Final,
  Unknow,
}
type Score = {
  type: ScoreType,
  data: string,
}

export class DeviceManager extends Event.EventEmitter {
  deviceCont: DeviceConnector | null;

  async searchDevices() {
    if (this.deviceCont) return true;
    const ports = await listPorts();
    const p = ports.find(_p => {
      return _p.vendorId === '1A86' && _p.productId === '7523';
    });
    if (!p) throw new Error('未找到设备');
    const port = new SerialPort(p.comName, {
      baudRate: 115200,
      parser: SerialPort.parsers.byteDelimiter([0x0d, 0x0a]),
    });
    const device = new DeviceConnector(port);
    await device.connect();
    this.deviceCont = device;
    this.deviceCont.once('disconnect', () => {
      this.emit('disconnect');
    });
    return true;
  }

  close() {
    if (this.deviceCont) {
      this.deviceCont.close();
    }
    this.deviceCont = null;
  }

  async getScore(device: string): Promise<null | Score> {
    if (!this.deviceCont) return null;
    this.deviceCont.send('TK', Buffer.from(device));
    const f = await this.deviceCont.await('TK', 1000, _f => {
      return asciiToString(_f.data.slice(0, 3)) === device;
    });

    let type: ScoreType = ScoreType.Unknow;
    if (f.data[4] === 'K'.charCodeAt(0)) {
      type = ScoreType.RealTime;
    } else if (f.data[4] === 'J'.charCodeAt(0)) {
      type = ScoreType.Final;
    }

    return {
      type,
      data: asciiToString(f.data.slice(5, f.data.length)),
    }
  }

  async startTest() {
    if (!this.deviceCont) return null;
    this.deviceCont.send('TH');
    await this.deviceCont.await('TH');
  }

  async endTest() {
    if (!this.deviceCont) return null;
    this.deviceCont.send('TS');
    await this.deviceCont.await('TS');
  }

  async setTestType(type: TestType): Promise<null | true> {
    if (!this.deviceCont) return null;
    this.deviceCont.send('SI', TestCode[type]);
    await this.deviceCont.await('SI');
    return true;
  }

  async getMaxDeviceNo(): Promise<string | null> {
    if (!this.deviceCont) return null;
    this.deviceCont.send('LM', 'S');
    const f = await this.deviceCont.await('LM');
    return asciiToString(f.data.slice(1, 4)) as string;
  }
}

class DeviceConnector extends Event.EventEmitter {
  port: SerialPort;
  initPromise: Promise<void>;
  closed: boolean = false;
  constructor(port: SerialPort) {
    super();
    this.port = port;
    port.on('error', this.onError);
    port.on('data', data => {
      const f = receiveFrame(Buffer.from(data));
      // console.log('RECEIVE', f);
    });
    this.initPromise = new Promise((resolve, reject) => {
      const onOpen = () => {
        resolve();
      };
      setTimeout(() => {
        reject()
      }, 2000);
      this.once('destory', () => {
        // tslint:disable-next-line:no-any
        (port as any).removeListener('open', onOpen);
      });
      // tslint:disable-next-line:no-any
      (port as any).once('open', onOpen);
    }) as Promise<void>;
  }
   onError(e: Error) {
    console.error(e);
  }

  close() {
    if (this.closed) return;
    this.port.close();
  }

  onClose() {
    this.closed = true;
    this.emit('destory');
  }

  onDisconnect() {
    this.emit('disconnect');
  }

  async connect() {
    await this.initPromise;
    await this.send('XR');
    await this.await('XR');
  }

  async send(cmd: string, data?: string | Buffer) {
    // console.log('SEND', cmd, data);
    const f = makeFrame(cmd, data);
    this.port.write(f);
  }

  await(cmd: string, timeout: number = 1000, verify?: (f: Frame) => boolean) {
    return new Promise((resolve, reject) => {
      const cb = (data: number[]) => {
        const f = receiveFrame(Buffer.from(data));
        if (!f) return;
        if (f.cmd.toLowerCase() === cmd.toLowerCase()) {
          // tslint:disable-next-line:no-any
          if (verify) {
            if (!verify(f)) return;
          }
          (this.port as any).removeListener('data', cb);
          resolve(f);
        }
      };

      setTimeout(() => {
        reject(new Error('连接超时'));
        // tslint:disable-next-line:no-any
        (this.port as any).removeListener('data', cb);
      }, timeout);
      this.port.on('data', cb);
    }) as Promise<Frame>;
  }
}

async function test() {
  const manager = new DeviceManager();
  await manager.searchDevices();
  await manager.startTest();
  while (true) {
    const s = await manager.getScore('001');
    if (!s) continue;
    if (s.data !== '0000') {
      console.log(s);
    }
  }
  // await manager.endTest();
  return s;
}

test().then(result => {
  console.log('ok', result);
  process.exit();
}, err => {
  console.log(err);
});
