import {
  DRP_LOAD_RECORDS,
  DRPloadRecordsAction,
  DRP_CLEAR,
} from '../actions/dailyReportPage';
import {
  defaultPagination,
} from './common';
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
        return state.records.concat(records);
      }, s => {
        return Object.assign({}, s, {
          pagination: ac.pagination
        })
      });
    }
  }

  return state;
}
