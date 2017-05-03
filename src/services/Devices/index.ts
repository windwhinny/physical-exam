import SerialPort = require('serialport');

function list () {
  return new Promise((resolve, reject) => {
    SerialPort.list((err, ports) => {
      if (err) return reject(err);
      resolve(ports);
    });
  }) as Promise<SerialPort.portConfig[]>;
}

const startBuffer = Buffer.from('$A@D');
function frame(cmd: string, data?: string | Buffer): Buffer {
  const cmdBuffer = Buffer.from(cmd);
  let dataBuffer: Buffer = Buffer.from([]);
  if (typeof data === 'string') {
    Buffer.from(data);
  } else if (data instanceof Buffer) {
    Buffer.from(data);
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

function receive(buffer: Buffer): null | {
  cmd: string,
  data: number[],
} {
  try {
    const gen = buffer.values();
    const header = readGen(gen, 4);
    if (Buffer.compare(startBuffer, Buffer.from(header))) {
      return null;
    }
    const length = readGen(gen, 1)[0];
    const body = readGen(gen, length);
    console.log(length, body.length);
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

async function start() {
  const ports = ([{
    comName: 'COM4',
  }]).map(p => new SerialPort(p.comName, {
    baudRate: 115200,
    parser: SerialPort.parsers.byteDelimiter([0x0d, 0x0a]),
  }));

  ports.map(p => {
    p.on('error', err => {
      console.error(err);
    })
    p.on('open', () => {
      const f = frame('LM', 'A');
      p.write(f);
    });
    p.on('data', data => {
      console.log(data)
      console.log('data', receive(Buffer.from(data)));
    })
    p.on('close', () => {
      console.log('closed');
    })
    p.on('disconnect', () => {
      console.log('disconnect');
    })
  });
}

start().then(() => {
}, err => {
  console.error(err);
  process.exit(1);
});
