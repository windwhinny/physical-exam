export enum TestType {
  Running50,
  Running80,
  Running100,
  /**
   * 往返跑步
   */
  RunningBackAndForth,
  /**
   * 跳绳
   */
  RopeSkipping,
  /**
   * 仰卧起坐
   */
  Situps,
  /**
   * 立定跳远
   */
  StandingLongJump,
  /**
   * 肺活量
   */
  VitalCapacity,
  /**
   * 坐位体前屈
   */
  SitAndReach,
  /**
   * 引体向上
   */
  PullUp,
  /**
   * 身高体重
   */
  HeightAndWeight,
  /**
   * 实心球
   */
  MedicineBall,
  /**
   * 未知项目
   */
  Unknow,
}

export const TestName = {
  [TestType.Running50]: '50米跑',
  [TestType.Running80]: '80米跑',
  [TestType.Running100]: '100米跑',
  [TestType.RopeSkipping]: '跳绳',
  [TestType.Situps]: '仰卧起坐',
  [TestType.StandingLongJump]: '立定跳远',
  [TestType.VitalCapacity]: '肺活量',
  [TestType.SitAndReach]: '坐位体前屈',
  [TestType.PullUp]: '引体向上',
  [TestType.RunningBackAndForth]: '50m×8 往返跑',
  [TestType.HeightAndWeight]: '身高体重',
  [TestType.MedicineBall]: '实心球',
}

export const TestUnitTemp = {
  [TestType.Running50]: '$0 秒',
  [TestType.Running80]: '$0 秒',
  [TestType.Running100]: '$0 秒',
  [TestType.RopeSkipping]: '$0 cm',
  [TestType.Situps]: '$0 次',
  [TestType.StandingLongJump]: '$0 cm',
  [TestType.VitalCapacity]: '$0 ml',
  [TestType.SitAndReach]: '$0 cm',
  [TestType.PullUp]: '$0 次',
  [TestType.RunningBackAndForth]: '$0 秒',
  [TestType.HeightAndWeight]: '$0 cm, $1 kg',
  [TestType.MedicineBall]: '$0 米',
}

export const TestCode = {
  [TestType.Running50]: '50',
  [TestType.Running80]: '8H',
  [TestType.Running100]: '1K',
  [TestType.RopeSkipping]: 'TS',
  [TestType.Situps]: 'YW',
  [TestType.StandingLongJump]: 'TY',
  [TestType.VitalCapacity]: 'FH',
  [TestType.SitAndReach]: 'QQ',
  [TestType.PullUp]: 'YT',
  [TestType.RunningBackAndForth]: '5W',
  [TestType.HeightAndWeight]: 'ST',
  [TestType.MedicineBall]: 'SX',
}

export type TestRecord = {
  id?: string,
  date: Date,
  student: {
    name: string,
    nu: string,
  },
  test: {
    score: string,
    type: TestType
  }
}

export type Pagination = {
  limit: number,
  page: number,
}

export interface RecordService {
  init(): Promise<void>;
  getById(id: string): Promise<TestRecord>;
  save(r: TestRecord): Promise<TestRecord>;
  searchStudent(keyword: string): Promise<{name: string, no: string}[]>;
  getByStudentNo(no: string, type: TestType, pagination: Pagination): Promise<TestRecord[]>;
  getByDate(date: Date, type: TestType | null, pagination: Pagination): Promise<TestRecord[]>;
  sync(): Promise<void>;
}
