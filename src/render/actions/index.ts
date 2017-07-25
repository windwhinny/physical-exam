import * as SelectedDateActions from './selectedDate';
import * as AppActions from './app';
import * as DailyReportPageActions from './dailyReportPage';
import * as SearchPageActions from './searchPage';
import * as StudentPageActions from './studentPage';
import * as CalendarPageActions from './calendarPage';

import { bindActionCreators } from '../utils';
import store from '../store';
const actions =  Object.assign({},
  SearchPageActions,
  SelectedDateActions,
  AppActions,
  DailyReportPageActions,
  StudentPageActions,
  CalendarPageActions,
) as
  typeof SearchPageActions &
  typeof SelectedDateActions &
  typeof AppActions &
  typeof DailyReportPageActions &
  typeof StudentPageActions &
  typeof CalendarPageActions;

export default bindActionCreators(actions, store.dispatch);
