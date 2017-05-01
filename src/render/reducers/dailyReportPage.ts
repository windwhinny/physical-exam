import {
  DRP_LOAD_RECORDS,
  DRPloadRecordsAction,
  DRP_CLEAR,
} from '../actions/dailyReportPage';

import {
  TestRecord,
  Pagination,
} from '../../constants';
import handlePromise from './handlePromise';
export type DailyReportPageState = {
  records: TestRecord[],
  error: Error | null,
  pending: boolean,
  pagination: Pagination,
}

const defaultState = {
  records: [],
  pending: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
  }
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

export default (
  state: DailyReportPageState = defaultState,
  action: DRPloadRecordsAction | RouteAction,
) => {
  switch (action.type) {
    case DRP_CLEAR:
      return Object.assign({}, state, {
        records: [],
      });
    case '@@router/LOCATION_CHANGE':
      action = action as RouteAction;
      if (action.payload.pathname === '/daily') {
        return Object.assign({}, state, {
          records: [],
        });
      }
      break;
    case DRP_LOAD_RECORDS:
      action = action as DRPloadRecordsAction;
      return handlePromise(state, 'records', action, records => {
        return state.records.concat(records);
      });
  }

  return state;
}
