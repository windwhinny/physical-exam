import {
  getReturnVal,
} from '../../lib/utils';
export const LOGIN_OR_LOGOUT = 'LOGIN_OR_LOGOUT';
export const loginOrLogout = (ip: string) => ({
  type: LOGIN_OR_LOGOUT,
  ip,
});
const loginOrLogoutRV = getReturnVal(loginOrLogout);
export type LoginOrLogoutAction = typeof loginOrLogoutRV;
