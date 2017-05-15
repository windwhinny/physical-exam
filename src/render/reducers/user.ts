import {
  LoginOrLogoutAction,
  LOGIN_OR_LOGOUT,
} from '../actions/user';

export type UserState = null | {
  ip: string
}

const defaultUserState = {
  ip: '1.1.1.1',
}

export default function(
  user: UserState = defaultUserState,
  action: LoginOrLogoutAction): UserState {
  switch (action.type) {
    case LOGIN_OR_LOGOUT:
      if (!action.ip) {
        return null;
      } else {
        return { ip: action.ip };
      }
  }
  return user;
}
