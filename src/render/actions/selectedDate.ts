import {
  getReturnVal,
} from '../../lib/utils';
export const UPDATE_SELECTED_DATE = 'UPDATE_SELECTED_DATE';

export const updateSelectedDate = (date: Date) => ({
  type: UPDATE_SELECTED_DATE,
  date,
})

const updateActionRV = getReturnVal(updateSelectedDate);

export type updateSelectedDateAction = typeof updateActionRV;
