import {
  SEARCH_STUDENT,
  CLEAR_SEARCH_RESULT,
  SearchStudentAction,
  ClearSearchResultAction,
  SET_SEARCH_KEYWORD,
  SetSearchKeywordAction,
} from '../actions/searchPage';
import handlePromsie from './handlePromise';
export type SearchPageState = {
  students: {name: string, no: string}[],
  pending: boolean,
  error: Error | null,
  keyword: string,
}

const defaultState = {
  students: [],
  pending: false,
  error: null,
  keyword: '',
}

export default (
  state: SearchPageState = defaultState,
  action: SearchStudentAction | ClearSearchResultAction | SetSearchKeywordAction,
) => {
  switch (action.type) {
    case SEARCH_STUDENT:
      return handlePromsie(state, 'students', action as SearchStudentAction, (s => s));
   case CLEAR_SEARCH_RESULT:
      return Object.assign({}, state, {
        students: [],
      });
   case SET_SEARCH_KEYWORD: {
     const ac = action as SetSearchKeywordAction;
     return Object.assign({}, state, {
       keyword: ac.keyword,
     });
   }
  }
  return state;
}
