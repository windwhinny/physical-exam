import { combineReducers} from 'redux'
import { routerReducer } from 'react-router-redux'
import user, { UserState } from './user';
import selectedDate  from './selectedDate';
import app, { AppState } from './app';
import dailyReportPage, { DailyReportPageState } from './dailyReportPage';

export default combineReducers({
  app,
  user,
  selectedDate,
  routing: routerReducer,
  dailyReportPage,
})

export type State = {
  user: UserState,
  selectedDate: Date,
  app: AppState,
  dailyReportPage: DailyReportPageState,
}
