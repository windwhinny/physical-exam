import RecordService from '../services/Record';
import ActionPromsie from './ActionPromise';

export const INIT_APP = 'INIT_APP';
export const initApp = () => {
  return {
    type: INIT_APP,
    promise: new ActionPromsie(RecordService('init')()),
  };
}
