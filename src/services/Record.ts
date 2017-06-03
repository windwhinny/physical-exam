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

  async sync(
    onProgress: (t: number, c: number) => void,
    host: string,
    limit: number = 5,
  ): Promise<void> {
    const total = await this.model.db.all({text: 'SELECT COUNT(uuid) as count from records', values: []});
    let proccessed = 0;
    if (!total) return;
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
    const url = `http://${host}/score/saves`;
    const fetch = (data: RecordPO[]) =>
      new Promise((resolve, reject) => {
        const body = (data.map(d => Object.assign({}, d, {
          testTime: getDateString(d.testTime),
          date: undefined,
          synced: undefined,
        })));
        request({
          url,
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
serviceIPCRegistor(recordService, 'RecordService');
export default recordService;

export function destory() {
  return recordService.model.db.close();
}
