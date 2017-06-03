import {
  LoginOrLogoutAction,
  LOGIN_OR_LOGOUT,
} from '../actions/user';

export type UserState = null | {
  ip: string
}

const lastIp = localStorage.getItem('ip');
const defaultUserState = lastIp ? {
  ip: lastIp,
} : null;

export default function(
  user: UserState = defaultUserState,
  action: LoginOrLogoutAction): UserState {
  switch (action.type) {
    case LOGIN_OR_LOGOUT:
      if (!action.ip) {
        localStorage.removeItem('ip');
        return null;
      } else {
        localStorage.setItem('ip', action.ip);
        return { ip: action.ip };
      }
  }
  return user;
}
