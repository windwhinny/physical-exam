import {
  getReturnVal,
} from '../../lib/utils';
import Device from '../services/Devices';
import RecordService from '../services/Record';
import ActionPromise from './ActionPromise';
import {
  Pagination,
  TestType,
  Student,
  TestRecord,
  Score,
  DeviceConfig,
} from '../../constants';

export const DRP_LOAD_RECORDS = 'DRP_LOAD_RECORDS';
export const DRPloadRecords = (date: Date, type: TestType | null, pagination: Pagination) => {
  return {
    type: DRP_LOAD_RECORDS,
    pagination,
    promise: new ActionPromise(RecordService('getByDate')(date, type, pagination)),
  };
}
const DRPloadRecordsRV = getReturnVal(DRPloadRecords);
export type DRPloadRecordsAction = typeof DRPloadRecordsRV;

export const DRP_CLEAR = 'DRP_CLEAR';
export const DRPClear = () => {
  return {
    type: DRP_CLEAR,
  };
}
const DRPClearRV = getReturnVal(DRPClear);
export type DRPClearAction = typeof DRPClearRV;

export const DRP_SYNC = 'DRP_SYNC';
export const DRPSync = () => {
  return {
    type: DRP_SYNC,
  };
}
const DRPSyncRV = getReturnVal(DRPSync);
export type DRPSyncAction = typeof DRPSyncRV;

export const DRP_CLEAR_TEST = 'DRP_CLEAR_TEST';
export const DRPClearTest = () => ({
  type: DRP_CLEAR_TEST,
});

export const DRP_SEARCH_DEVICES = 'DRP_SEARCH_DEVICES';
export const DRPSearchDevices = (type: TestType, config?: DeviceConfig) => {
  const promise = Device('searchRF')().then(() => {
    return Device('setTestType')(type);
  })
  .then(() => {
    return Device('getDeviceList')();
  })
  .then(list => {
    return list.map(item => ({
      deviceNo: item,
    }));
  })
  .then(devices => {
    if (devices.length && config) {
      return Device('updateDeviceConfig')(type, config).then(() => devices);
    } else {
      return devices;
    }
  });
  return {
    type: DRP_SEARCH_DEVICES,
    promise: new ActionPromise(promise),
  };
};
const DRPSearchDevicesRV = getReturnVal(DRPSearchDevices);
export type DRPSearchDevicesAction = typeof DRPSearchDevicesRV;

export const DRP_ADD_STUDENT = 'DRP_ADD_STUDENT';
export const DRPAddStudent = (student: Student) => ({
  type: DRP_ADD_STUDENT,
  student,
});
const DRPAddStudentRV = getReturnVal(DRPAddStudent);
export type DRPAddStudentAction = typeof DRPAddStudentRV;


export const DRP_CLEAR_TEST_BY_INDEX = 'DRP_CLEAR_TEST_BY_INDEX';
export const DRPClearTestByIndex = (index: number) => ({
  type: DRP_CLEAR_TEST_BY_INDEX,
  index,
});
const DRPClearTestByIndexRV = getReturnVal(DRPClearTestByIndex);
export type DRPClearTestByIndexAction = typeof DRPClearTestByIndexRV;

export const DRP_PREPARE_TEST = 'DRP_PREPARE_TEST';
export const DRPPrepareTest = () => {
  return {
    type: DRP_PREPARE_TEST,
  }
};
const DRPPrepareTestRV = getReturnVal(DRPPrepareTest);
export type DRPPrepareTestAction = typeof DRPPrepareTestRV;

export const DRP_START_TEST = 'DRP_START_TEST';
export const DRPStartTest = () => {
  return {
    type: DRP_START_TEST,
    promise: new ActionPromise(Device('startTest')()),
  }
};
const DRPStartTestRV = getReturnVal(DRPStartTest);
export type DRPStartTestAction = typeof DRPStartTestRV;

export const DRP_END_TEST = 'DRP_END_TEST';
export const DRPEndTest = (type: TestType, maxRound: number) => {
  return {
    type: DRP_END_TEST,
    promise: new ActionPromise(Device('endTest')()),
    testType: type,
    maxRound,
  }
};
const DRPEndTestRV = getReturnVal(DRPEndTest);
export type DRPEndTestAction = typeof DRPEndTestRV;

export const DRP_GET_SCORE = 'DRP_GET_SCORE';
export const DRPGetScore = (type: TestType, deviceNo: string) => {
  return {
    type: DRP_GET_SCORE,
    promise: new ActionPromise(Device('getScore')(type, deviceNo)),
    deviceNo,
  }
};
const DRPGetScoreRV = getReturnVal(DRPGetScore);
export type DRPGetScoreAction = typeof DRPGetScoreRV;

export const DRP_CLEAR_ERROR = 'DRP_CLEAR_ERROR';
export const DRPClearError = () => {
  return {
    type: DRP_CLEAR_ERROR,
  };
}

export const DRP_SAVE_TEST_RESULT = 'DRP_SAVE_TEST_RESULT';
export const DRPSaveTestResult = (records: TestRecord[]) => {
  return {
    type: DRP_SAVE_TEST_RESULT,
    promise: new ActionPromise(RecordService('save')(records)),
  }
};
const DRPSaveTestResultRV = getReturnVal(DRPSaveTestResult);
export type DRPSaveTestResultAction = typeof DRPSaveTestResultRV;

export const DRP_SAVE_TEMP_SCORE = 'DRP_SAVE_TEMP_SCORE';
export const DRPSaveTempScore = (records: {
  deviceNo: string,
  score: Score,
}[]) => ({
  type: DRP_SAVE_TEMP_SCORE,
  records,
});
const DRPSaveTempScoreRV = getReturnVal(DRPSaveTempScore);
export type DRPSaveTempScoreAction = typeof DRPSaveTempScoreRV;
