import {
  UPDATE_SELECTED_DATE,
  updateSelectedDateAction,
} from '../actions/selectedDate';

export default function(d: Date = new Date(), action: updateSelectedDateAction) {
  switch (action.type) {
    case UPDATE_SELECTED_DATE:
      return action.date;
  }
  return d;
}
