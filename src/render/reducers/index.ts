import { combineReducers} from 'redux'
import { routerReducer, RouterState } from 'react-router-redux'
import user, { UserState } from './user';
import selectedDate  from './selectedDate';
import app, { AppState } from './app';
import dailyReportPage, { DailyReportPageState } from './dailyReportPage';
import searchPage, { SearchPageState } from './searchPage';
import studentPage, { StudentPageState } from './studentPage';
import calendarPage, { CalendarPageState } from './calendarPage';

export default combineReducers({
  app,
  user,
  selectedDate,
  routing: routerReducer,
  dailyReportPage,
  searchPage,
  studentPage,
  calendarPage,
})

export type State = {
  routing: RouterState,
  user: UserState,
  selectedDate: Date,
  app: AppState,
  dailyReportPage: DailyReportPageState,
  searchPage: SearchPageState,
  studentPage: StudentPageState,
  calendarPage: CalendarPageState,
}
