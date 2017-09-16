import fs = require('fs');
import path = require('path');
import { app } from 'electron';

// tslint:disable:no-any
export class Logger {
  stream: fs.WriteStream | null = null;
  constructor() {
    const logDir = path.join(app.getPath('userData'), 'logs');
    const today = new Date();
    const logFile = `${this.getDateStr(today)}.log`;

    fs.readdir(logDir, (err, files) => {
      if (err) this.error(err);
      if (!files) return;
      files.forEach(file => {
        if (file === logFile) return;
        fs.unlink(path.join(logDir, file), e => {
          if (e) this.error(e);
        });
      });
    });

    const createLogFile = () => {
      this.stream = fs.createWriteStream(path.join(logDir, logFile), {
        flags: 'a',
      });
    }

    fs.access(logDir, (err) => {
      if (!err) {
        createLogFile();
      } else {
        fs.mkdir(logDir, e => {
          if (e) {
            this.error(e);
          } else {
            createLogFile();
          }
        })
      }
    });
  }

  log(message?: any, ...optionalParams: any[]) {
    console.log(message, ...optionalParams);
    this.write('LOG', message, ...optionalParams);
  }

  error(message?: any, ...optionalParams: any[]) {
    console.error(message, ...optionalParams);
    this.write('ERR', message, ...optionalParams);
  }

  info(message?: any, ...optionalParams: any[]) {
    console.info(message, ...optionalParams);
    this.write('INF', message, ...optionalParams);
  }

  warn(message?: any, ...optionalParams: any[]) {
    console.warn(message, ...optionalParams);
    this.write('WAR', message, ...optionalParams);
  }

  private fixedStr(n: number) {
    return String(100 + n).slice(1);
  }

  private getDateStr(d: Date) {
    const year = d.getFullYear();
    const month = d.getMonth();
    const date = d.getDate();
    return `${year}-${this.fixedStr(month + 1)}-${this.fixedStr(date)}`;
  }

  private getTimeStr(d: Date) {
    const hour = d.getHours();
    const minutes = d.getMinutes();
    const sec = d.getSeconds();

    return `${this.fixedStr(hour)}:${this.fixedStr(minutes)}:${this.fixedStr(sec)}`;
  }

  private write(type: string, message?: any, ...optionalParams: any[]) {
    if (!this.stream) return;
    const now = new Date();
    const array = [this.getDateStr(now), this.getTimeStr(now), type, ':'];

    optionalParams.unshift(message);

    optionalParams.forEach(p => {
      if (p instanceof Error) {
        array.push(p.message, '\n');
        if (p.stack) {
          array.push(p.stack);
        }
      } else if (typeof p === 'string') {
        array.push(p);
      } else {
        try {
          array.push(JSON.stringify(p));
        } catch (e) {
          return;
        }
      }
    });
    const buffer = Buffer.from(array.join(' ') + '\n');
    this.stream.write(buffer);
  }
}

const logger = new Logger();

export default logger;
