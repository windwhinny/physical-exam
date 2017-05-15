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
