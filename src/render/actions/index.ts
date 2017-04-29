import * as UserActions from './user';
import * as SelectedDateActions from './selectedDate';
import { bindActionCreators } from '../utils';
import store from '../store';

export default bindActionCreators(
  Object.assign({}, UserActions, SelectedDateActions),
  store.dispatch);
