export enum TestType {
  Running50,
  Running800,
  Running1000,
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
  [TestType.Running800]: '800米跑',
  [TestType.Running1000]: '1000米跑',
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
  [TestType.Running800]: '$0 圈，$1 秒',
  [TestType.Running1000]: '$0 圈，$1 秒',
  [TestType.RopeSkipping]: '$0 次',
  [TestType.Situps]: '$0 次',
  [TestType.StandingLongJump]: '$0 cm',
  [TestType.VitalCapacity]: '$0 ml',
  [TestType.SitAndReach]: '$0 cm',
  [TestType.PullUp]: '$0 次',
  [TestType.RunningBackAndForth]: '$1 圈，$2 秒',
  [TestType.HeightAndWeight]: '$0 cm, $1 kg',
  [TestType.MedicineBall]: '$0 米',
}

export const TestCode = {
  [TestType.Running50]: '50',
  [TestType.Running800]: '8H',
  [TestType.Running1000]: '1K',
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

export const testSettings = {
  [TestType.Situps]: 60,
  [TestType.RopeSkipping]: 60,
  [TestType.Running1000]: 5,
  [TestType.Running800]: 4,
  [TestType.StandingLongJump]: 3,
  [TestType.VitalCapacity]: 3,
  [TestType.SitAndReach]: 3,
};

export type DeviceConfig = {
  testTime?: number,
  runningRound?: number,
}

export type Student = {
  name: string,
  nu: string,
  gender: Gender,
}

export type TestRecord = {
  id?: string,
  date: Date,
  student: Student,
  test: {
    score: string,
    type: TestType
  },
  user: {
    ip: string,
  },
  sign?: string,
}

export type Pagination = {
  limit: number,
  page: number,
  done: boolean,
}

export enum ScoreType {
  RealTime,
  Final,
  Unknow,
}

export type Score = {
  type: ScoreType,
  data: string,
}

export enum Gender {
  Male = 1,
  Female = 2,
}


export interface RecordService {
  init(): Promise<void>;
  getById(id: string): Promise<TestRecord>;
  save(r: TestRecord[]): Promise<TestRecord[]>;
  searchStudent(keyword: string): Promise<{name: string, no: string}[]>;
  getByStudentNo(no: string, type: TestType, pagination: Pagination): Promise<TestRecord[]>;
  getByDate(date: Date, type: TestType | null, pagination: Pagination): Promise<TestRecord[]>;
  getByDateRange(from: Date, to: Date, type?: TestType): Promise<string[]>;
  sync(
    onProgress: (t: number, c: number, u: number) => void,
    onError: (record: TestRecord) => void,
    url: string,
    type: 'bluetooth' | 'http',
  ): Promise<void>;
}

export interface DeviceManagerService {
  searchRF(): Promise<boolean>;
  close(): void;
  getScore(type: TestType, device: string): Promise<null | Score>;
  startTest(): Promise<null | true>;
  endTest(): Promise<null | true>;
  setTestType(type: TestType): Promise<null | true>;
  updateDeviceConfig(type: TestType, config: DeviceConfig): Promise<null>;
  getDeviceList(): Promise<string[]>;
  getMaxDeviceNo(): Promise<string | null>;
}

export interface BluetoothService {
  listDevices(cb: (device: {
    name: string,
    address: string,
  }) => void): Promise<void>;
}

export interface CardReaderService {
  read(
    pin: string,
    cb: (student: Student) => void,
    onError?: (err: Error) => void,
  ): Promise<void>;
  stopRead(): void;
}

// tslint:disable:no-any
export interface Logger {
  log(message?: any, ...optionalParams: any[]): void;
  error(message?: any, ...optionalParams: any[]): void;
  info(message?: any, ...optionalParams: any[]): void;
  warn(message?: any, ...optionalParams: any[]): void;
}
