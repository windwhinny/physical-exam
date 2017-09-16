import RecordService from '../services/Record';
import ActionPromsie from './ActionPromise';
import {
  getReturnVal,
} from '../../lib/utils';

export const APP_INIT = 'APP_INIT';
export const AppInit = () => {
  return {
    type: APP_INIT,
    promise: new ActionPromsie(RecordService('init')()),
  };
}

export const APP_CHANGE_MODE = 'APP_CHANGE_MODE';
export const AppChangeMode = (mode: string) => ({
  type: APP_CHANGE_MODE,
  mode,
});
const AppChangeModeRV = getReturnVal(AppChangeMode);
export type AppChangeModeAction = typeof AppChangeModeRV;

export const APP_UPDATE_PIN_CODE = 'APP_UPDATE_PIN_CODE';
export const AppUpdatePinCode = (pinCode: string) => ({
  type: APP_UPDATE_PIN_CODE,
  pinCode,
});
const AppUpdatePinCodeRV = getReturnVal(AppUpdatePinCode);
export type AppUpdatePinCodeAction = typeof AppUpdatePinCodeRV;

export const APP_SET_UPLOAD_URL = 'SET_UPLOAD_URL';
export const AppSetUploadUrl = (url: string) => ({
  type: APP_SET_UPLOAD_URL,
  url,
});
const SetUploadUrlRV = getReturnVal(AppSetUploadUrl);
export type AppSetUploadUrlAction = typeof SetUploadUrlRV;

export const APP_UPDATE_TEST_ROUND = 'APP_UPDATE_TEST_ROUND';
export const AppUpdateTestRound = (round: number) => ({
  type: APP_UPDATE_TEST_ROUND,
  round,
});
const UpdateTestRoundRV = getReturnVal(AppUpdateTestRound);
export type AppUpdateTestRoundAction = typeof UpdateTestRoundRV;

export const APP_UPDATE_DEVICE_NO = 'APP_UPDATE_DEVICE_NO';
export const AppUpdateDeviceNo = (no: string | null) => ({
  type: APP_UPDATE_DEVICE_NO,
  deviceNo: no,
});
const UpdateDeviceNoRV = getReturnVal(AppUpdateDeviceNo);
export type AppUpdateDeviceNoAction = typeof UpdateDeviceNoRV;
