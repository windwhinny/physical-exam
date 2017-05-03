import ActionPromise from './ActionPromise';
import RecordService from '../services/Record';
import {
  TestType,
  Pagination
} from '../../constants';
import {
  getReturnVal,
} from '../../lib/utils';

export const GET_STUDENT_RECORDS = 'GET_STUDENT_RECORDS';
export const getStudentRecords = (no: string, type: TestType, pagination: Pagination) => ({
  type: GET_STUDENT_RECORDS,
  testType: type,
  pagination,
  promise: new ActionPromise(RecordService('getByStudentNo')(no, type, pagination))
});
const getStudentRecordsRV = getReturnVal(getStudentRecords);
export type GetStudentRecordsAction = typeof getStudentRecordsRV;

export const STUDNET_PAGE_SWITCH_ITEM = 'STUDNET_PAGE_SWITCH_ITEM';
export const studentPageSwitchItem = (type: TestType) => ({
  type: STUDNET_PAGE_SWITCH_ITEM,
  testType: type,
});
const studentPageSwitchItemRV = getReturnVal(studentPageSwitchItem);
export type StudentPageSwitchItemAction = typeof studentPageSwitchItemRV;

export const CLEAR_STUDENT_PAGE_RECORDS = 'CLEAR_STUDENT_PAGE_RECORDS';
export const clearStudentPageRecords = () => ({
  type: CLEAR_STUDENT_PAGE_RECORDS,
});
const clearStudentPageRecordsRV = getReturnVal(clearStudentPageRecords);
export type ClearStudentPageRecordsAction = typeof clearStudentPageRecordsRV;
