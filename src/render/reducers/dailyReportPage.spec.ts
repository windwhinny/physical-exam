import {
  testReducer,
  TestState,
} from './dailyReportPage';
import ActionPromise from '../actions/ActionPromise';
import {
  DRPPrepareTest,
  DRP_START_TEST,
  DRPStartTestAction,
  DRP_SEARCH_DEVICES,
  DRPSearchDevicesAction,
  DRP_GET_SCORE,
  DRPGetScoreAction,
  DRP_END_TEST,
  DRPEndTestAction,
} from '../actions/dailyReportPage';
import {
  ScoreType,
  TestType,
} from '../../constants';

describe('dailyReportPageReducer', () => {
  let state: TestState;
  beforeEach(() => {
    state = testReducer(undefined, {
      type: '@@redux/INIT',
    });
  })

  describe('testReducer', () => {
    it('should return init state', () => {
      expect(state).not.toBe(null);
    });

    it('should change status when prepare', () => {
      state = testReducer(state, DRPPrepareTest());
      expect(state.status).toBe('prepare');
    });

    it('多次测试之后应保存最佳的成绩', async () => {
      const deviceNo = '1';
      // 设置设备
      state = testReducer(state, {
        type: DRP_SEARCH_DEVICES,
        promise: await new ActionPromise(Promise.resolve([{
          deviceNo,
        }])).await(),
      } as DRPSearchDevicesAction);
      // 准备测试
      state = testReducer(state, DRPPrepareTest());
      // 开始第一轮测试
      state = testReducer(state, {
        type: DRP_START_TEST,
        promise: await new ActionPromise(Promise.resolve(true)).await(),
      } as DRPStartTestAction);
      // 获取分数
      state = testReducer(state, {
        type: DRP_GET_SCORE,
        promise: await new ActionPromise(Promise.resolve({
          type: ScoreType.RealTime,
          data: '123',
        })).await(),
        deviceNo,
      } as DRPGetScoreAction);
      // 结束第一轮测试
      state = testReducer(state, {
        type: DRP_END_TEST,
        promise: await new ActionPromise(Promise.resolve(true)).await(),
        testType: TestType.SitAndReach,
        maxRound: 2,
      } as DRPEndTestAction);
       // 开始第二轮测试
       state = testReducer(state, {
        type: DRP_START_TEST,
        promise: await new ActionPromise(Promise.resolve(true)).await(),
      } as DRPStartTestAction);
      // 获取分数
      state = testReducer(state, {
        type: DRP_GET_SCORE,
        promise: await new ActionPromise(Promise.resolve({
          type: ScoreType.RealTime,
          data: '13',
        })).await(),
        deviceNo,
      } as DRPGetScoreAction);
      // 结束第二轮测试
      state = testReducer(state, {
        type: DRP_END_TEST,
        promise: await new ActionPromise(Promise.resolve(true)).await(),
        testType: TestType.SitAndReach,
        maxRound: 2,
      } as DRPEndTestAction);
      const score = state.deviceList[0].score;
      if (!score) throw new Error('expect score to exists');
      expect(score.data).toBe('123');
    });
  });
})
