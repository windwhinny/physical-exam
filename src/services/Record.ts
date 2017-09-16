import DB from '../lib/DB';
import request = require('request');
import URL = require('url');
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
import BluetootService from './Bluetooth';
import Logger from './Logger';

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
      this.updateIndex();
    } catch (e) {
      db.close();
      throw e;
    }
  }

  updateIndex() {
    const indexes = [
      `CREATE INDEX date ON records (
        date,
        item
      );`,
      `CREATE UNIQUE INDEX uuid ON records (
        uuid
      );`,
      `CREATE INDEX stuNo ON records (
        stuNo,
        item
      );`,
      `CREATE INDEX stuNoAndName ON records (
        stuNo,
        stuName
      );`,
      `CREATE INDEX testTime ON records (
        testTime
      );`,
      `CREATE INDEX synced ON records (
        synced
      );`
    ];
    // tslint:disable-next-line:no-any
    indexes.reduce((p: Promise<any>, index) => {
      return p.then(() => {
        this.model.db.run({
          text: index,
          values: [],
        })
      })
      .then(() => null, (err) => Logger.error('RecordService indexes', err));
    }, Promise.resolve());
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
          if (po.score === 'error') return null;
          return po;
        }).filter(Boolean) as RecordPO[];
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

  transformServerFormat(record: RecordPO, deviceNo: string) {
    type Time = {
      min: number,
      sec: number,
      milSec: number,
    }
    const getSecFromTimeStr = (str: string): Time => {
      let sec = Number(str);
      const min = Math.floor(sec / 60);
      sec = sec - min * 60;
      return {
        min,
        sec,
        milSec: 0,
      }
    }

    const toMin = (time: Time): string => {
      return `${time.min}.${time.sec || '00'}`;
    }

    const transformRecord  = () => {
      let strs: string[] = [];
      let time: Time;
      switch (record.item) {
      case '50':
      case '1K':
      case '8H':
      case '5W':
        if (record.score.includes(',')) {
          strs = record.score.split(',');
          time = getSecFromTimeStr(strs[1]);
          return toMin(time);
        } else {
          return toMin(getSecFromTimeStr(record.score));
        }
      case 'TY':
        return String(Number(record.score) / 100);
      default:
        return record.score;
      }
    }

    const getItemCode = () => {
      switch (record.item) {
      case '50':
        return '0009';
      case '8H':
        return '0016';
      case '1K':
        return '0001';
      case 'TS':
        return '0014';
      case 'YW':
        return '0017';
      case 'TY':
        return '0012';
      case 'YT':
        return '0015';
      case 'SX':
        return '0013';
      default:
        return '';
      };
      //   [TestType.VitalCapacity]: 'FH',
      //   [TestType.SitAndReach]: 'QQ',
      //   [TestType.RunningBackAndForth]: '5W',
      //   [TestType.HeightAndWeight]: 'ST',
      // }
    }

    const data = {
      userName: 'zkAdmin',
      passWord: 'pw123456',
      soleIdentifying: deviceNo,
      studentItemList: [{
        itemCode: getItemCode(),
        itemScore: transformRecord(),
        studentCode: record.stuNo,
      }],
    }

    return JSON.stringify(data);
  }

  isServerResponseSuccess(data: string): boolean {
    try {
      const res = JSON.parse(data);
      if (res.status ===  '1') {
        return true;
      }
    } catch (e) {
      return false;
    }
    return false;
  }

  httpSync(url: string, deviceNo: string, data: RecordPO) {
    return new Promise((resolve, reject) => {
        const body = this.transformServerFormat(data, deviceNo);
        const urlObj = URL.parse(url, true);
        urlObj.query.param = body;
        delete urlObj.search;
        Logger.log('RecordService httpSync request body', body);
        request({
          url: URL.format(urlObj),
          method: 'GET',
          json: false,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36',
          },
        // tslint:disable-next-line:no-any
        }, (err: Error, _: any, resBody: string) => {
          if (err) return reject(err);
          Logger.log('RecordService httpSync response body', resBody);
          if (this.isServerResponseSuccess(resBody)) {
            resolve();
            return;
          }
          reject(new Error('上传失败'));
          _;
        });
      });
  }

  bluetoothSync(address: string, data: RecordPO, total: number, uploaded: number) {
    let height: undefined | number = undefined;
    let weight: undefined | number = undefined;
    let performance: undefined | string = undefined;
    if (data.item === 'ST') {
      const strs = data.score.split(',');
      height = Number(strs[0]);
      weight = Number(strs[1]);
    } else {
      performance = data.score;
    }
    const transData = {
      currentIndex: uploaded,
      total,
      dbPerformance: {
        type: data.item === 'ST' ? 'bmi' : codeMap[data.item as keyof typeof codeMap],
        studentId: data.stuNo,
        height,
        weight,
        performance,
        time: data.testTime.getTime(),
        isSubmit: 0,
        isExternal: 1,
        studName: data.stuName,
      },
    }
    Logger.log('bluetoothSync', transData);
    return BluetootService.sync(address, JSON.stringify(transData));
  }

  async sync(
    onProgress: (t: number, c: number, r: number) => void,
    onError: (record: TestRecord) => void,
    address: string,
    deviceNo: string | null,
    type: 'bluetooth' | 'http',
  ): Promise<void> {
    const total = await this.model.db.all({text: 'SELECT COUNT(uuid) as count from records where synced = 0', values: []});
    let proccessed = 0;
    let uploaded = 0;
    if (!total) return;
    const get = () => this.model.findOne({
        where: {
          synced: 0,
        },
        offset: proccessed - uploaded,
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
    while (true) {
      const rs = await get();
      try {
        let result: string = '';
        if (type === 'http') {
          if (!rs) break;
          if (!deviceNo) throw new Error('no deviceNo');
          await this.httpSync(address, deviceNo, rs);
        } else {
          if (!rs) {
            await BluetootService.sync(address, null);
            break;
          }
          // tslint:disable-next-line:no-any
          result = await this.bluetoothSync(address, rs, (total as any)[0].count, uploaded);
        }
        await update(rs);
        onError(this.reverse(rs));
        uploaded++;
      } catch (e) {
        onError(this.reverse(rs));
        Logger.error('RecordService sync', e);
      }
      proccessed++;
      // tslint:disable-next-line:no-any
      onProgress((total as any)[0].count, proccessed, uploaded);
    }
  }
}

const recordService = new RecordService();
serviceIPCRegistor(recordService, 'RecordService');
export default recordService;

export function destory() {
  return recordService.model.db.close();
}
