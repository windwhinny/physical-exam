import * as UserActions from './user';
import * as SelectedDateActions from './selectedDate';
import * as AppActions from './app';
import * as DailyReportPageActions from './dailyReportPage';
import * as SearchPageActions from './searchPage';
import * as StudentPageActions from './studentPage';

import { bindActionCreators } from '../utils';
import store from '../store';

export default bindActionCreators(
  Object.assign({},
    SearchPageActions,
    UserActions,
    SelectedDateActions,
    AppActions,
    DailyReportPageActions,
    StudentPageActions,
  ),
  store.dispatch);
