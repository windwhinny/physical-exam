import * as UserActions from './user';
import * as SelectedDateActions from './selectedDate';
import * as AppActions from './app';
import * as DailyReportPageActions from './dailyReportPage';

import { bindActionCreators } from '../utils';
import store from '../store';

export default bindActionCreators(
  Object.assign({},
    UserActions,
    SelectedDateActions,
    AppActions,
    DailyReportPageActions,
  ),
  store.dispatch);
