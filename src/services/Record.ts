import DB from '../lib/DB';
import request = require('request');
import uuid = require('uuid');
import {
  getStartOfDate,
  getEndOfDate,
  getDateString,
  oneDay,
} from '../lib/date';
import RecordModel, { RecordPO, RecordModelSchema } from '../models/Record'
import {
  WhereCondition,
} from '../definitions/sql';
import {
  TestType,
  TestRecord,
  TestCode,
  Pagination,
  RecordService as RecordServiceInterface,
} from '../constants';
import serviceIPCRegistor from './registor';
import { sync as bluetoothSync } from './Bluetooth';

const fields = Object.keys(RecordModelSchema).filter(a => a !== 'sign');
class RecordService implements RecordServiceInterface {
   model: RecordModel;
  async init() {
    if (this.model) return;
    const db = new DB();
    try {
      await db.open();
      const model = new RecordModel(db);
      await model.sync();
      this.model = model;
    } catch (e) {
      db.close();
      throw e;
    }
  }
  private transform(r: TestRecord): RecordPO {
    const date = new Date(r.date);
    return {
      uuid: r.id,
      stuNo: r.student.nu,
      stuName: r.student.name,
      item: TestCode[r.test.type],
      score: r.test.score,
      result: 1,
      testTime: date,
      synced: 0,
      date: getDateString(date),
      gender: r.student.gender,
      ip: r.user.ip,
      sign: r.sign as string,
    }
  }

  private reverse(r: RecordPO): TestRecord {
    // tslint:disable-next-line:no-any
    const type = Object.keys(TestCode).find((c) => TestCode[c as any] === r.item);

    return {
      id: r.uuid,
      date: new Date(r.testTime),
      student: {
        name: r.stuName,
        nu: r.stuNo,
        gender: r.gender,
      },
      test: {
        score: r.score,
        type: type ? Number(type) as TestType : TestType.Unknow,
      },
      user: {
        ip: r.ip,
      },
    };
  }

  async getById(id: string): Promise<TestRecord> {
    const po = await this.model.findOne({
      where: {
        uuid: id,
      },
      attrs: fields,
    }) as RecordPO;
    return this.reverse(po);
  }

  async save(records: TestRecord[]): Promise<TestRecord[]> {
    return this.model.db.transaction((t) => {
      return [(async () => {
        let pos = records.map(r => {
          const po = this.transform(r)
          po.uuid = uuid.v4();
          return po;
        });
        pos = await this.model.insertMulti(pos, t) as RecordPO[];
        return pos.map(p => this.reverse(p));
      })()];
    })
  }

  async searchStudent(keyword: string): Promise<{name: string, no: string}[]> {
    const search = `%${keyword}%`;
    const r = await this.model.find({
      where: {
        $or: [{
          stuNo: {$lk: search},
        }, {
          stuName: {$lk: search}
        }]
      },
      limit: 10,
      distinct: ['stuName', 'stuNo'],
    }) as {stuName: string, stuNo: string}[];
    return r.map(_ => ({
      name: _.stuName,
      no: _.stuNo
    }));
  }

  async getByStudentNo(no: string, type: TestType, pagination: Pagination): Promise<TestRecord[]> {
    const rs = await this.model.find({
      where: {
        stuNo: no,
        item: TestCode[type],
      },
      limit: pagination.limit,
      offset: (pagination.page - 1) * pagination.limit,
      attrs: fields,
    }) as RecordPO[];
    return rs.map(this.reverse);
  }

  async getByDateRange(from: Date, to: Date, type?: TestType): Promise<string[]> {
    const dateStrs = [];
    from = new Date(from);
    to = new Date(to);
    console.log('from', from , 'to', to);
    while (from.getTime() <= to.getTime()) {
      dateStrs.push(getDateString(from));
      from = new Date(from.getTime() + oneDay);
    }

    // tslint:disable-next-line:no-any
    const where: any = {
      date: { $in: dateStrs },
    }

    if (type) {
      where.item = TestCode[type];
    }
    const ret = await this.model.find({
      where,
      distinct: ['date'],
    }) as {date: string}[];
    return ret.map(r => r.date);
  }

  async getByDate(date: Date, item: TestType | null, pagination: Pagination): Promise<TestRecord[]> {
    const query = {
      testTime: {
        $gt: getStartOfDate(date),
        $lt: getEndOfDate(date),
      },
    } as WhereCondition;
    if (item !== null) {
      Object.assign(query, {
        item: TestCode[item],
      });
    }
    const rs = await this.model.find({
      where: query,
      limit: pagination.limit,
      offset: (pagination.page - 1) * pagination.limit,
      attrs: fields,
    }) as RecordPO[];
    return rs.map(this.reverse);
  }

  transformServerFormat(record: RecordPO) {
    type Time = {
      min: number,
      sec: number,
      milSec: number,
    }
    const getSecFromTimeStr = (str: string): Time => {
      const match = str.match(/(\d*)'(\d*)''(\d*)/);
      if (!match) return {min: 0, sec: 0, milSec: 0};
      const min = Number(match[1]);
      const sec = Number(match[2]);
      const milSec  = Number(match[3]);
      return {
        min,
        sec,
        milSec,
      }
    }

    const toMin = (time: Time): string => {
      return `${time.min}.${time.sec}`;
    }

    const transformRecord  = () => {
      let strs: string[] = [];
      let time: Time;
      switch (record.item) {
      case '1K':
      case '8H':
        strs = record.score.split(',');
        time = getSecFromTimeStr(strs[1]);
        return toMin(time);
      case '5W':
        strs = record.score.split(',');
        time = getSecFromTimeStr(strs[2]);
        return toMin(time);
      default:
        return record.score;
      }
    }

    const codeMap = {
      '50': 'wsmp',
      '8H': 'bbmp',
      '1K': 'yqmp',
      'TS': 'ts',
      'YW': 'ywqz',
      'TY': 'ldty',
      'FH': 'fhl',
      'QQ': 'zwtqq',
      'YT': 'ytxs',
      '5W': 'wsmcbwfp',
      'ST': 'sg',
      'SX': 'sxq',
    }
    const data = {
      number: record.stuNo,
      testType: codeMap[record.item as keyof typeof codeMap],
      time: Math.round(record.testTime.getTime() / 1000),
      score: transformRecord(),
    }

    return `data=${JSON.stringify(data)}`;
  }

  isServerResponseSuccess(data: string): boolean {
    const match = data.match(/^callback\((.*)\)$/);
    if (!match) return false;
    try {
      const res = JSON.parse(match[1]);
      if (res.status ===  1) {
        return true;
      }
    } catch (e) {
      return false;
    }
    return false;
  }

  httpSync(host: string, data: RecordPO) {
    const url = `http://${host}/health/index.php/Api/Index/transfer`;
    return new Promise((resolve, reject) => {
        const body = this.transformServerFormat(data);
        request({
          url,
          headers: {
            'Content-type': 'application/x-www-form-urlencoded',
          },
          method: 'POST',
          body,
          json: false,
        // tslint:disable-next-line:no-any
        }, (err: Error, _: any, resBody: string) => {
          if (err) return reject(err);
          if (this.isServerResponseSuccess(resBody)) {
            resolve();
            return;
          }
          reject(new Error('上传失败'));
          _;
        });
      });
  }

  bluetoothSync(address: string, data: RecordPO) {
    return bluetoothSync(address, JSON.stringify(this.transformServerFormat(data)));
  }

  async sync(
    onProgress: (t: number, c: number, r: string) => void,
    address: string = '121.41.13.138',
    type: 'bluetooth' | 'http' = 'http',
  ): Promise<void> {
    const total = await this.model.db.all({text: 'SELECT COUNT(uuid) as count from records', values: []});
    let proccessed = 0;
    if (!total) return;
    const get = () => this.model.findOne({
        where: {
          synced: 0,
        },
      }) as Promise<RecordPO>;

    const update = (data: RecordPO) => {
      return this.model.update({
        synced: 1,
      }, {
        uuid: data.uuid as string,
      });
    };

    // const fetch = () => new Promise(resolve => {
    //   setTimeout(resolve, 10000);
    // });
    let errorTimes = 0;
    while (true) {
      const rs = await get();
      if (!rs) break;
      try {
        let result: string = '';
        if (type === 'http') {
          await this.httpSync(address, rs);
        } else {
          result = await this.bluetoothSync(address, rs);
        }
        await update(rs);
        proccessed += 1;
        // tslint:disable-next-line:no-any
        onProgress((total as any)[0].count, proccessed, result);
      } catch (e) {
        console.error(e);
        if (errorTimes >= 0) {
          throw new Error('上传失败');
        }
        errorTimes++;
      }
    }
  }
}

const recordService = new RecordService();
serviceIPCRegistor(recordService, 'RecordService');
export default recordService;

export function destory() {
  return recordService.model.db.close();
}
