export const INIT_APP = Symbol();
import RecordService from '../services/Record';
import ActionPromsie from './ActionPromise';

export const initApp = () => {
  return {
    type: INIT_APP,
    promise: new ActionPromsie(RecordService('init')()),
  };
}
