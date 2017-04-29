export enum TestType {
  Running50,
  Running80,
  Running100,
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
}

export const TestName = {
  [TestType.Running50]: '50米跑',
  [TestType.Running80]: '80米跑',
  [TestType.Running100]: '100米跑',
  [TestType.RopeSkipping]: '跳绳',
  [TestType.Situps]: '仰卧起坐',
  [TestType.StandingLongJump]: '立定跳远',
  [TestType.VitalCapacity]: '肺活量',
}

export type TestRecord = {
  id: string,
  student: {
    name: string,
    code: string,
  },
  test: {
    value: number,
    type: TestType
  }
}
