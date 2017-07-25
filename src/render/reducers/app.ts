import {
  AppInit,
  APP_INIT,
  APP_CHANGE_MODE,
  APP_UPDATE_PIN_CODE,
  AppUpdatePinCodeAction,
  AppChangeModeAction,
  AppSetUploadUrlAction,
  APP_SET_UPLOAD_URL
} from '../actions/app';
import {
  getReturnVal,
} from '../../lib/utils';
const loginOrLogoutAction = getReturnVal(AppInit);

export type AppState = {
  pending: boolean,
  inited: boolean,
  mode: string,
  pinCode: string | null,
  uploadUrl: string | null,
}

export default function(
  state: AppState = {
    pending: true,
    inited: false,
    mode: localStorage.getItem('mode') || 'normal',
    pinCode: localStorage.getItem('pin-code') || null,
    uploadUrl: localStorage.getItem('upload-url') || null,
  },
  action: typeof loginOrLogoutAction | AppChangeModeAction | AppUpdatePinCodeAction | AppSetUploadUrlAction): AppState {
  switch (action.type) {
    case APP_INIT: {
      const ac = action as typeof loginOrLogoutAction;
      switch (ac.promise.status) {
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
    case APP_SET_UPLOAD_URL: {
      const ac = action as AppSetUploadUrlAction;
      localStorage.setItem('upload-url', ac.url);
      return Object.assign({}, state, {
        uploadUrl: ac.url,
      });
    }
    case APP_UPDATE_PIN_CODE: {
      const ac = action as AppUpdatePinCodeAction;
      localStorage.setItem('pin-code', ac.pinCode);
      return Object.assign({}, state, {
        pinCode: ac.pinCode,
      });
    }
    case APP_CHANGE_MODE: {
      const ac = action as AppChangeModeAction;
      localStorage.setItem('mode', ac.mode);
      return Object.assign({}, state, {
        mode: ac.mode,
      });
    }
  }
  return state;
}
