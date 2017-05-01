import {
  getReturnVal,
} from '../../lib/utils';
import RecordService from '../services/Record';
import ActionPromsie from './ActionPromise';
import {
  Pagination,
  TestType,
} from '../../constants';

export const DRP_LOAD_RECORDS = 'DRP_LOAD_RECORDS';
export const DRPloadRecords = (date: Date, type: TestType | null, pagination: Pagination) => {
  return {
    type: DRP_LOAD_RECORDS,
    promise: new ActionPromsie(RecordService('getByDate')(date, type, pagination)),
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
