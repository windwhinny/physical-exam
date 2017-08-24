import SerialPort = require('serialport');
import {
  TestType,
  DeviceConfig,
} from '../../constants';

export type Frame = {
  cmd: string,
  data: number[],
}
export function listPorts () {
  return new Promise((resolve, reject) => {
    SerialPort.list((err, ports) => {
      if (err) return reject(err);
      resolve(ports);
    });
  }) as Promise<SerialPort.portConfig[]>;
}


const startBuffer = Buffer.from('$A@D');
export function makeFrame(cmd: string, data?: string | Buffer): Buffer {
  const cmdBuffer = Buffer.from(cmd);
  let dataBuffer: Buffer = Buffer.from([]);
  if (typeof data === 'string') {
    dataBuffer = Buffer.from(data);
  } else if (data instanceof Buffer) {
    dataBuffer = Buffer.from(data);
  }

  const lengthBuffer = Buffer.from([cmdBuffer.length + dataBuffer.length]);
  let check = 0;

  for (let i of cmdBuffer.values()) {
    check += i;
  }

  for (let i of dataBuffer.values()) {
    check += i;
  }

  return Buffer.concat([
    startBuffer,
    lengthBuffer,
    cmdBuffer,
    dataBuffer,
    Buffer.from([check % 0x100]),
    Buffer.from('\r\n'),
  ]);
}

function readGen(gen: IterableIterator<number>, length: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < length; i++) {
    const v = gen.next();
    if (v.done && i !== length - 1) throw new Error('out of range');
    result.push(v.value);
  }
  return result;
}

export function receiveFrame(buffer: Buffer): null | Frame {
  try {
    const gen = buffer.values();
    const header = readGen(gen, 4);
    if (Buffer.compare(startBuffer, Buffer.from(header))) {
      return null;
    }
    const length = readGen(gen, 1)[0];
    const body = readGen(gen, length);
    const cmd = Buffer.from(body.slice(0, 2)).toString();
    const data = body.slice(2, body.length);
    return {
      cmd,
      data,
    };
  } catch (e) {
    console.log(e);
    return null;
  }
}

export function compareArray<T>(array1: T[], array2: T[]): boolean {
  if (array1.length !== array2.length) return false;
  for (let i = 0 ; i < array1.length; i++) {
    if (array1[i] !== array2[i]) return false;
  }
  return true;
}

export function asciiToString(n: number[]): string {
  return Buffer.from(n).toString('ascii');
}

function timeStr(str: string): string {
  const min = Number(str.slice(0, 2));
  const sec = Number(str.slice(2, 4));
  const minSec = Number(str.slice(4));
  return `${min}'${sec}''${minSec}`;
}

export function transformScore(type: TestType, data: string): string {
  if (data.includes('eee') || data.includes('EEE')) return 'error';
  switch (type) {
    case TestType.Running1000:
    case TestType.Running800:
      return `${Number(data.slice(0, 2))},${timeStr(data.slice(2))}`;
    case TestType.RunningBackAndForth:
      return `${Number(data.slice(0, 2))},${Number(data.slice(2, 4))},${timeStr(data.slice(4))}`;
    case TestType.HeightAndWeight:
      return `${Number(data.slice(0, 6))},${Number(data.slice(6))}`;
    default:
      return String(Number(data));
  }
}

export function transformConfig(type: TestType, config: DeviceConfig) {
  const { testTime, runningRound } = config;
  switch (type) {
    case TestType.Running1000:
    case TestType.Running800:
      if (!runningRound) return null;
      return '000' + String(100 + runningRound).slice(1) + '3031020';
    case TestType.Situps:
    case TestType.RopeSkipping:
      if (!testTime) return null;
      const min = Math.floor(testTime / 60);
      const sec = testTime % 60;

      return '000' + String(100 + min).slice(1) + String(100 + sec).slice(1);
  }
  return null;
}
