import {
  DRP_LOAD_RECORDS,
  DRPloadRecordsAction,
  DRP_CLEAR,
  DRP_CLEAR_TEST,
  DRP_SEARCH_DEVICES,
  DRPSearchDevicesAction,
  DRP_ADD_STUDENT,
  DRPAddStudentAction,
  DRP_CLEAR_TEST_BY_INDEX,
  DRPClearTestByIndexAction,
  DRP_START_TEST,
  DRPStartTestAction,
  DRPPrepareTestAction,
  DRP_PREPARE_TEST,
  DRP_END_TEST,
  DRPEndTestAction,
  DRP_GET_SCORE,
  DRPGetScoreAction,
  DRP_CLEAR_ERROR,
  DRP_SAVE_TEST_RESULT,
  DRPSaveTestResultAction,
  DRP_SAVE_TEMP_SCORE,
  DRPSaveTempScoreAction,
} from '../actions/dailyReportPage';
import {
  defaultPagination,
} from './common';
import {
  TestRecord,
  Pagination,
  Student,
  Score,
} from '../../constants';
import scoreGreatorThan from '../helpers/scoreGreatorThan';
import handlePromise from './handlePromise';

export type TestDevice = {
  deviceNo: string,
  score?: Score,
}

export type TestState = {
  deviceList: TestDevice[],
  students: (Student | null)[],
  tempRecords: {
    deviceNo: string,
    score: Score,
  }[],
  pending: boolean,
  error: Error | null,
  status: string,
  round: number,
}
export type DailyReportPageState = {
  records: TestRecord[],
  error: Error | null,
  pending: boolean,
  pagination: Pagination,
  test: TestState,
}

const defaultTestState = {
  deviceList: [],
  students: [],
  pending: false,
  error: null,
  status: 'idle',
  round: 0,
  tempRecords: [],
}

const defaultState = {
  records: [],
  pending: false,
  error: null,
  pagination: defaultPagination,
  test: defaultTestState,
}

type RouteAction = {
  type: '@@router/LOCATION_CHANGE',
  payload: {
    hash: string,
    key: string,
    pathname: string,
    search: string,
  }
}

const testReducer = (
  state: TestState = defaultTestState,
  action:
    DRPSearchDevicesAction |
    DRPAddStudentAction |
    DRPClearTestByIndexAction |
    DRPStartTestAction |
    DRPPrepareTestAction |
    DRPEndTestAction |
    DRPGetScoreAction |
    DRPSaveTestResultAction |
    DRPSaveTempScoreAction
) => {
  switch (action.type) {
    case DRP_CLEAR_TEST: {
      return Object.assign({}, state, { deviceList: [] });
    }
    case DRP_SEARCH_DEVICES: {
      const ac = action as DRPSearchDevicesAction;
      return handlePromise(state, 'deviceList', ac);
    }
    case DRP_ADD_STUDENT: {
      const ac = action as DRPAddStudentAction;
      const students = state.students.slice();
      const exists = students.find(s => s ? s.nu === ac.student.nu : false)
      if (exists) return state;
      const index = students.indexOf(null);
      if (index > -1) {
        students[index] = ac.student;
      } else {
        students.push(ac.student);
      }
      if (students.length > state.deviceList.length) return state;
      return Object.assign({}, state, { students })
    }
    case DRP_CLEAR_TEST_BY_INDEX: {
      const ac = action as DRPClearTestByIndexAction;
      const index = ac.index;
      const students = state.students.slice();
      students[index] = null;
      return Object.assign({}, state, { students })
    }
    case DRP_PREPARE_TEST: {
      return Object.assign({}, state, {
        status: 'prepare',
      });
    }
    case DRP_START_TEST: {
      const ac = action as DRPStartTestAction;
      switch (ac.promise.status) {
        case 'pending':
          return Object.assign({}, state, {
            deviceList: state.deviceList.map(d => Object.assign({}, d, {
              score: undefined,
            })),
            status: 'pending',
          });
        case 'resolved':
          return Object.assign({}, state, {
            status: 'testing',
            round: state.round + 1,
            tempRecords: state.round === 0 ? [] : state.tempRecords,
          });
        case 'rejected':
          return Object.assign({}, state, {
            error: ac.promise.error,
            status: 'idle',
          });
      }
    }
    case DRP_END_TEST: {
      const ac = action as DRPEndTestAction;
      switch (ac.promise.status) {
        case 'pending':
          return Object.assign({}, state, {
            status: 'pending',
          });
        case 'resolved':
          const maxRound = ac.maxRound;
          const round = state.round < maxRound ? state.round : 0;
          let deviceList = state.deviceList;
          deviceList = deviceList.map(device => {
            const temp = state.tempRecords.find(d => d.deviceNo === device.deviceNo);
            if (!temp) return device;
            if (!device.score) {
              return Object.assign({}, device, {
                score: temp.score,
              });
            } else if (scoreGreatorThan(ac.testType, temp.score, device.score) > 0) {
              return Object.assign({}, device, {
                score: temp.score,
              });
            }
            return device;
          });
          return Object.assign({}, state, {
            status: 'idle',
            round,
            tempRecords: round === 0 ? [] : state.tempRecords,
            deviceList,
          });
        case 'rejected':
          return Object.assign({}, state, {
            error: ac.promise.error,
            status: 'idle',
          });
      }
    }
    case DRP_GET_SCORE: {
      const ac = action as DRPGetScoreAction;
      switch (ac.promise.status) {
        case 'pending': break;
        case 'resolved':
          if (!ac.promise.result) break;
          const deviceList = state.deviceList.slice();
          const device = state.deviceList.find(d => d.deviceNo === ac.deviceNo);
          if (!device) break;
          deviceList[deviceList.indexOf(device)] = Object.assign({}, device, {
            score: ac.promise.result
          });
          return Object.assign({}, state, { deviceList });
      }
    }
    case DRP_CLEAR_ERROR: {
      return Object.assign({}, state, { error: null });
    }
    case DRP_SAVE_TEST_RESULT: {
      const ac = action as DRPSaveTestResultAction;
       switch (ac.promise.status) {
        case 'pending':
          return Object.assign({}, state, {
            status: 'pending',
          });
        case 'resolved':
          return Object.assign({}, state, {
            deviceList: state.deviceList.map(d => Object.assign({}, d, { score: undefined })),
            students: [],
            status: 'idle',
          });
        case 'rejected':
          return Object.assign({}, state, {
            error: ac.promise.error,
            status: 'idle',
          });
      }
    }
    case DRP_SAVE_TEMP_SCORE: {
      const ac = action as DRPSaveTempScoreAction;
      return Object.assign({}, state, {
        tempRecords: ac.records,
      })
    }
  }
  return state;
}

export default (
  state: DailyReportPageState = defaultState,
  action: DRPloadRecordsAction | RouteAction,
) => {
  switch (action.type) {
    case DRP_CLEAR:
      return Object.assign({}, state, {
        records: [],
        pagination: defaultPagination,
      });
    case '@@router/LOCATION_CHANGE':
      action = action as RouteAction;
      if (action.payload.pathname === '/daily') {
        return Object.assign({}, state, {
          records: [],
          pagination: defaultPagination,
        });
      }
      break;
    case DRP_LOAD_RECORDS: {
      const ac  = action as DRPloadRecordsAction;
      return handlePromise(state, 'records', ac, records => {
        if (!records.length) ac.pagination.done = true;
        return state.records.concat(records);
      }, s => {
        return Object.assign({}, s, {
          pagination: ac.pagination
        })
      });
    }
  }

  // tslint:disable-next-line:no-any
  const test = testReducer(state.test, action as any);
  if (test !== state.test) {
    return Object.assign({}, state, { test });
  }
  return state;
}
