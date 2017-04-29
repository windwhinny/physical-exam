import {
  loginOrLogout,
  LOGIN_OR_LOGOUT,
} from '../actions/user';
import {
  getReturnVal,
} from '../../lib/utils';

const loginOrLogoutAction = getReturnVal(loginOrLogout);

export type UserState = null | {
  ip: string
}

export default function(user: UserState = null, action: typeof loginOrLogoutAction): UserState {
  switch (action.type) {
    case LOGIN_OR_LOGOUT:
      if (user) {
        return null;
      } else {
        return { ip: '1.2.3.4' };
      }
  }
  return user;
}
