import SerialPort = require('serialport');
import Event = require('events');
import {
  listPorts,
  makeFrame,
  receiveFrame,
  Frame,
  asciiToString,
  transformScore,
  transformConfig,
} from './utils';
import {
  TestType,
  TestCode,
  DeviceManagerService,
  Score,
  ScoreType,
  DeviceConfig,
} from '../../constants';
import serviceIPCRegistor from '../registor';

export class DeviceManager extends Event.EventEmitter implements DeviceManagerService {
  deviceCont: DeviceConnector | null;

  async searchRF() {
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

  async getScore(testType: TestType, device: string): Promise<null | Score> {
    if (!this.deviceCont) return null;
    const f = await this.deviceCont.sendAndAwait(
      'TK',
      Buffer.from(device),
      1000,
      _f => {
        return asciiToString(_f.data.slice(0, 3)) === device;
      });

    let type: ScoreType = ScoreType.Unknow;
    if (f.data[4] === 'K'.charCodeAt(0)) {
      type = ScoreType.RealTime;
    } else if (f.data[4] === 'J'.charCodeAt(0)) {
      type = ScoreType.Final;
    }

    const score = transformScore(testType, asciiToString(f.data.slice(5, f.data.length)));
    return {
      type,
      data: score,
      final: f.data[5] === 'J'.charCodeAt(0)
    }
  }

  async startTest() {
    if (!this.deviceCont) return null;
    await this.deviceCont.sendAndAwait('TH');
    return true;
  }

  async endTest() {
    if (!this.deviceCont) return null;
    await this.deviceCont.sendAndAwait('TS');
    return true;
  }

  async updateDeviceConfig(type: TestType, config: DeviceConfig) {
    if (!this.deviceCont) return null;
    const data = transformConfig(type, config);
    if (data) {
      await this.deviceCont.sendAndAwait('PT', data);
    }
    return null;
  }

  async setTestType(type: TestType): Promise<null | true> {
    if (!this.deviceCont) return null;
    const f = await this.deviceCont.sendAndAwait('SI', 'FF');
    const code = TestCode[type];
    if (Buffer.from(f.data).toString() !== code) {
      await this.deviceCont.sendAndAwait('SI', code);
    }
    return true;
  }

  async getDeviceList() {
    if (!this.deviceCont) return null;
    const maxNo = Number(await this.getMaxDeviceNo());
    let no = 1;
    const devices: string[] = [];
    while (no <= maxNo) {
      const strNo = String(1000 + no).slice(1);
      const f = await this.deviceCont.sendAndAwait(
        'LK',
        `S${strNo}`,
        1000,
        _f => {
          return Buffer.from(_f.data.slice(1, 4)).toString() === strNo;
        });
      if (Buffer.from(f.data).toString()[4] === '1') {
        devices.push(strNo);
      }
      no++;
    }
    return devices;
  }

  async getMaxDeviceNo(): Promise<string | null> {
    if (!this.deviceCont) return null;
    const f = await this.deviceCont.sendAndAwait('LM', 'S', 2000);
    return asciiToString(f.data.slice(1, 4)) as string;
  }
}

class DeviceConnector extends Event.EventEmitter {
  port: SerialPort;
  initPromise: Promise<{}>;
  closed: boolean = false;
  constructor(port: SerialPort) {
    super();
    this.port = port;
    port.on('error', this.onError);
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
    }) as Promise<{}>;
  }
   onError(e: Error) {
    console.error(e);
  }

  close() {
    if (this.closed) return;
    return new Promise((resolve) => {
      this.port.close(resolve);
    });
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
    await this.sendAndAwait('XR');
  }

  async sendAndAwait(
    cmd: string,
    data?: string | Buffer,
    timeout: number = 1000,
    verify?: (f: Frame) => boolean
  ) {
    this.send(cmd, data);
    // tslint:disable-next-line:no-any
    let timmer: any;
    return new Promise((resolve, reject) => {
      const cb = (_data: number[]) => {
        const f = receiveFrame(Buffer.from(_data));
        if (!f) return;
        if (f.cmd.toLowerCase() === 'rr') {
          setTimeout(() => {
            this.send(cmd, data);
          }, 3 * 1000);
          _setTimeout(3 * 1000 + timeout);
        } else if (f.cmd.toLowerCase() === cmd.toLowerCase()) {
          // tslint:disable-next-line:no-any
          if (verify) {
            if (!verify(f)) return;
          }
          // tslint:disable-next-line:no-any
          (this.port as any).removeListener('data', cb);
          resolve(f);
          clearTimeout(timmer);
        }
      };

      const _setTimeout = (t: number) => {
        clearTimeout(timmer);
        timmer = setTimeout(() => {
          reject(new Error('连接超时'));
          // tslint:disable-next-line:no-any
          (this.port as any).removeListener('data', cb);
        }, t);
      }

      _setTimeout(timeout);
      this.port.on('data', cb);
    }) as Promise<Frame>;
  }

  send(cmd: string, data?: string | Buffer) {
    // console.log('SEND', cmd, data);
    const f = makeFrame(cmd, data);
    this.port.write(f);
  }
}

const manager = new DeviceManager();
serviceIPCRegistor(manager, 'DeviceManager');

export async function destory() {
  if (!manager) return;
  if (!manager.deviceCont) return;
  await manager.deviceCont.close();
}

// async function test() {
//   await manager.searchRF();
//   if (!manager.deviceCont) return null;
//   return manager.deviceCont.sendAndAwait('XS');
// }

// test().then((r) => {
//     console.log('ok', r);
// }, err => {
//     console.error(err);
// })
