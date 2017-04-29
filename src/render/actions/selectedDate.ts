export const UPDATE_SELECTED_DATE = Symbol();

export const updateSelectedDate = (date: Date) => ({
  type: UPDATE_SELECTED_DATE,
  date,
})

