import {
  UPDATE_SELECTED_DATE,
  updateSelectedDate,
} from '../actions/selectedDate';
import {
  getReturnVal,
} from '../../lib/utils';

const updateAction = getReturnVal(updateSelectedDate);

export default function(d: Date = new Date(), action: typeof updateAction) {
  switch (action.type) {
    case UPDATE_SELECTED_DATE:
      return action.date;
  }
  return d;
}
