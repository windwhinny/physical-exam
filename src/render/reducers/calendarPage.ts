import handlePromise from './handlePromise';
import {
  defaultPagination,
} from './common'
import {
  TestType,
  TestRecord,
  Pagination,
} from '../../constants';
import {
  CPChangeTypeAction,
  CP_CHANG_TYPE,
  CP_LOAD_RECORDS,
  CPloadRecordsAction,
} from '../actions/calendarPage';
export type CalendarPageState = {
  type: TestType,
  records: TestRecord[],
  pending: boolean,
  error: Error | null,
  pagination: Pagination,
}

const defaultState = {
  type: TestType.Running50,
  error: null,
  pending: false,
  records: [],
  pagination: defaultPagination,
}

export default (
  state: CalendarPageState = defaultState,
  action: CPChangeTypeAction | CPloadRecordsAction,
) => {
  switch (action.type) {
    case CP_CHANG_TYPE: {
      const ac = action as CPChangeTypeAction;
      return Object.assign({}, state, {
        type: ac.testType,
      });
    }
    case CP_LOAD_RECORDS:
      const ac = action as CPloadRecordsAction;
      return handlePromise(state, 'records', ac,  s => {
        if (!s.length) ac.pagination.done = true;
        if (ac.pagination.page !== state.pagination.page) {
          console.log('appended')
          return state.records.concat(s);
        }
        return s;
      }, s => Object.assign({}, s, {
        pagination: ac.pagination,
      }));
  }
  return state;
}
