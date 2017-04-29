import { combineReducers} from 'redux'
import { routerReducer } from 'react-router-redux'
import user, { UserState } from './user';
import selectedDate  from './selectedDate';

export default combineReducers({
  user,
  selectedDate,
  routing: routerReducer,
})

export type State = {
  user: UserState,
  selectedDate: Date,
}
