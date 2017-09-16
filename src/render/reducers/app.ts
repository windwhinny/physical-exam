import {
  AppInit,
  APP_INIT,
  APP_CHANGE_MODE,
  APP_UPDATE_PIN_CODE,
  AppUpdatePinCodeAction,
  AppChangeModeAction,
  AppSetUploadUrlAction,
  APP_SET_UPLOAD_URL,
  APP_UPDATE_TEST_ROUND,
  AppUpdateTestRoundAction,
  APP_UPDATE_DEVICE_NO,
  AppUpdateDeviceNoAction,
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
  deviceNo: string | null,
  uploadUrl: string | null,
  testRound: number,
}

export default function(
  state: AppState = {
    pending: true,
    inited: false,
    mode: localStorage.getItem('mode') || 'normal',
    pinCode: localStorage.getItem('pin-code') || null,
    uploadUrl: localStorage.getItem('upload-url') || null,
    deviceNo: localStorage.getItem('device-no') || null,
    testRound: 1,
  },
  action: typeof
    loginOrLogoutAction
    | AppChangeModeAction
    | AppUpdatePinCodeAction
    | AppSetUploadUrlAction
    | AppUpdateTestRoundAction
    | AppUpdateDeviceNoAction
  ): AppState {
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
    case APP_UPDATE_DEVICE_NO: {
      const ac = action as AppUpdateDeviceNoAction;
      if (ac.deviceNo) {
        localStorage.setItem('device-no', ac.deviceNo);
      } else {
        localStorage.removeItem('device-no');
      }
      return Object.assign({}, state, {
        deviceNo: ac.deviceNo,
      });
    }
    case APP_UPDATE_PIN_CODE: {
      const ac = action as AppUpdatePinCodeAction;
      if (ac.pinCode) {
        localStorage.setItem('pin-code', ac.pinCode);
      } else {
        localStorage.removeItem('pin-code');
      }
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
    case APP_UPDATE_TEST_ROUND: {
      const ac = action as AppUpdateTestRoundAction;
      return Object.assign({}, state, {
        testRound: ac.round,
      });
    }
  }
  return state;
}
