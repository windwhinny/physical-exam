import {
  TestType,
  Pagination,
} from '../../constants';
import {
  getReturnVal,
} from '../../lib/utils';
import ActionPromsie from './ActionPromise';
import RecordService from '../services/Record';

export const CP_CHANG_TYPE = 'CP_CHANG_TYPE';
export const cpChangeType = (type: TestType) => ({
  type: CP_CHANG_TYPE,
  testType: type,
})
const cpChangeTypeRV = getReturnVal(cpChangeType);
export type CPChangeTypeAction = typeof cpChangeTypeRV;

export const CP_LOAD_RECORDS = 'CP_LOAD_RECORDS';
export const CPloadRecords = (date: Date, type: TestType | null, pagination: Pagination) => {
  return {
    type: CP_LOAD_RECORDS,
    pagination,
    promise: new ActionPromsie(RecordService('getByDate')(date, type, pagination)),
  };
}
const CPloadRecordsRV = getReturnVal(CPloadRecords);
export type CPloadRecordsAction = typeof CPloadRecordsRV;

export const CP_CLEAR = 'CP_CLEAR';
export const CPClear = () => {
  return {
    type: CP_CLEAR,
  };
}
const CPClearRV = getReturnVal(CPClear);
export type CPClearAction = typeof CPClearRV;
