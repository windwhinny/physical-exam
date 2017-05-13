import {
  LoginOrLogoutAction,
  LOGIN_OR_LOGOUT,
} from '../actions/user';

export type UserState = null | {
  ip: string
}

export default function(
  user: UserState = null,
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
