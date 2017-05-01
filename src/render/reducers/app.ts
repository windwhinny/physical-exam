import {
  initApp,
  INIT_APP,
} from '../actions/app';
import {
  getReturnVal,
} from '../../lib/utils';
const loginOrLogoutAction = getReturnVal(initApp);

export type AppState = {
  pending: boolean,
  inited: boolean,
}

export default function(
  state: AppState = {
    pending: true,
    inited: false,
  },
  action: typeof loginOrLogoutAction): AppState {
  switch (action.type) {
    case INIT_APP:
      switch (action.promise.status) {
        case 'pending':
          return Object.assign({}, state, {
            pending: true,
            inited: false,
          });
        case 'resolved':
          return Object.assign({}, state, {
            pending: false,
            inited: true,
          });
        case 'rejected':
          return Object.assign({}, state, {
            pending: false,
            inited: false,
          });
      }
  }
  return state;
}
