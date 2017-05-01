import DB from '../lib/DB';
import electron = require('electron');
import {
  getStartOfDate,
  getEndOfDate,
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
    return {
      uuid: r.id,
      stuNo: r.student.nu,
      stuName: r.student.name,
      item: TestCode[r.test.type],
      score: r.test.score,
      result: 1,
      testTime: new Date(r.date),
      synced: 0,
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

  async searchStudent(keyword: string): Promise<string[]> {
    const search = `%${keyword}%`;
    const r = await this.model.find({
      where: {
        $or: {
          stuNo: {$lk: search},
          stuName: {$lk: search}
        }
      },
      distinct: 'stuName',
    }) as {stuName: string}[];
    return r.map(_ => _.stuName);
  }

  async getByStudent(name: string, pagination: Pagination): Promise<TestRecord[]> {
    const rs = await this.model.find({
      where: {
        stuName: name,
      },
      limit: pagination.limit,
      offset: (pagination.page - 1) * pagination.limit,
    }) as RecordPO[];
    return rs.map(this.reverse);
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

  async sync() {

  }
}

const recordService = new RecordService();
Object.getOwnPropertyNames(Object.getPrototypeOf(recordService)).forEach((name: keyof RecordService) => {
  const channel = `RecordService:${name}`;
  // tslint:disable-next-line:no-any
  ipcMain.on(channel, async (event: any, id: number, ...args: any[]) => {
    console.info('RECEIVE', name, ...args);
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
