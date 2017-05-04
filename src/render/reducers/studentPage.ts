import handlePromsie from './handlePromise';
import {
  defaultPagination,
} from './common';
import {
  GET_STUDENT_RECORDS,
  GetStudentRecordsAction,
  STUDNET_PAGE_SWITCH_ITEM,
  StudentPageSwitchItemAction,
  CLEAR_STUDENT_PAGE_RECORDS,
  ClearStudentPageRecordsAction,
} from '../actions/studentPage';
import {
  TestRecord,
  TestType,
  Pagination,
} from '../../constants';

export type StudentPageState = {
  records: TestRecord[],
  pending: boolean,
  error: Error | null,
  type: TestType,
  pagination: Pagination,
}

const defaultState = {
  records: [],
  pending: false,
  error: null,
  type: TestType.Running50,
  pagination: defaultPagination,
}

export default (
  state: StudentPageState = defaultState,
  action: GetStudentRecordsAction | StudentPageSwitchItemAction | ClearStudentPageRecordsAction,
) => {
  switch (action.type) {
  case GET_STUDENT_RECORDS: {
    let ac = action as GetStudentRecordsAction;
    return handlePromsie(state, 'records', ac, (s => {
      if (!s.length) ac.pagination.done = true;
      if (state.pagination.page !== ac.pagination.page) {
        return state.records.concat(s);
      }
      return s;
    }), s => {
      return Object.assign({}, s, {
        pagination: ac.pagination,
      });
    });
  }
  case STUDNET_PAGE_SWITCH_ITEM: {
    let ac = action as StudentPageSwitchItemAction;
    return Object.assign({}, state, {
      type: ac.testType,
      records: [],
      pagination: defaultPagination,
    })
  }
  case CLEAR_STUDENT_PAGE_RECORDS:
    return Object.assign({}, state, {
      records: [],
      pagination: defaultPagination,
    });
  }
  return state;
}
