import DB from '../lib/DB';
import electron = require('electron');
import request = require('request');
import {
  getStartOfDate,
  getEndOfDate,
  getDateString,
  oneDay,
} from '../lib/date';
import RecordModel, { RecordPO } from '../models/Record'
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

const ipcMain = electron.ipcMain;

class RecordService implements RecordServiceInterface {
  private model: RecordModel;
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
      },
      test: {
        score: r.score,
        type: type ? Number(type) as TestType : TestType.Unknow,
      },
    };
  }

  async getById(id: string): Promise<TestRecord> {
    const po = await this.model.findOne({
      where: {
        uuid: id,
      },
    }) as RecordPO;
    return this.reverse(po);
  }

  async save(r: TestRecord): Promise<TestRecord> {
    let po = this.transform(r);
    po = await this.model.insert(po) as RecordPO;
    return this.reverse(po);
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
    }) as RecordPO[];
    return rs.map(this.reverse);
  }

  async sync(
    onProgress: (t: number, c: number) => void,
    host: string = 'http://47.93.230.19:8080/score/saves',
    limit: number = 5,
  ): Promise<void> {
    const total = await this.model.db.all({text: 'SELECT COUNT(uuid) as count from records', values: []});
    let proccessed = 0;
    if (total) return;
    const get = () => this.model.find({
        where: {
          synced: 0,
        },
        limit,
      }) as Promise<RecordPO[]>;

    const update = (data: RecordPO[]) => {
      return this.model.update({
        synced: 1,
      }, {
        uuid: { $in: data.map(d => d.uuid as string)},
      });
    };

    const fetch = (data: RecordPO[]) =>
      new Promise((resolve, reject) => {
        const body = (data.map(d => Object.assign({}, d, {
          testTime: getDateString(d.testTime),
          date: undefined,
          synced: undefined,
        })));
        console.log(body);
        request({
          url: host,
          method: 'POST',
          headers: {
            'Content-type': 'application/json',
          },
          body,
          json: true,
        // tslint:disable-next-line:no-any
        }, (err: Error, _: any, resBody: { code: number }) => {
          if (err) return reject(err);
          if (resBody.code !== 1) return reject(new Error('上传失败'));
          resolve();
          _;
        });
      });

    // const fetch = () => new Promise(resolve => {
    //   setTimeout(resolve, 10000);
    // });
    let errorTimes = 0;
    while (true) {
      const rs = await get();
      if (!rs.length) break;
      try {
        await fetch(rs);
        await update(rs);
        proccessed += rs.length;
        // tslint:disable-next-line:no-any
        onProgress((total as any)[0].count, proccessed);
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
Object.getOwnPropertyNames(Object.getPrototypeOf(recordService)).forEach((name: keyof RecordService) => {
  const channel = `RecordService:${name}`;
  // tslint:disable-next-line:no-any
  ipcMain.on(channel, async (event: any, id: number, ...args: any[]) => {
    console.info('RECEIVE', name, ...args);
    // tslint:disable-next-line:no-any
    args = args.map(arg => {
      if (Array.isArray(arg) && arg[0] === 'IPC-CALLBACK') {
        // tslint:disable-next-line:no-any
        return (...subargs: any[]) => {
          event.sender.send(`RecordService:${name}:callback`, id, arg[1], subargs);
        };
      }
      return arg;
    });
    // tslint:disable-next-line:no-any
    let result: any;
    try {
      result = await recordService[name].apply(recordService, args);
    } catch (e) {
      console.error('ERROR', e);
      event.sender.send(`RecordService:${name}:reject`, id, e);
      return;
    }
    event.sender.send(`RecordService:${name}:resolve`, id, result);
  });
});

export default recordService;
