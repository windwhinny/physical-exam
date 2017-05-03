import ActionPromise from './ActionPromise';
import RecordService from '../services/Record';
import {
  getReturnVal,
} from '../../lib/utils';

export const SEARCH_STUDENT = 'SEARCH_STUDENT';
export const searchStudent = (keyword: string) => ({
  type: SEARCH_STUDENT,
  promise: new ActionPromise(RecordService('searchStudent')(keyword)),
})
const searchStudentRV = getReturnVal(searchStudent);
export type SearchStudentAction = typeof searchStudentRV;

export const CLEAR_SEARCH_RESULT = 'CLEAR_SEARCH_RESULT';
export const clearSearchResult = () => ({
  type: CLEAR_SEARCH_RESULT,
});
const clearSearchResultRV = getReturnVal(clearSearchResult);
export type ClearSearchResultAction = typeof clearSearchResultRV;

export const SET_SEARCH_KEYWORD = 'SET_SEARCH_KEYWORD';
export const setSearchKeyword = (kw: string) => ({
  type: SET_SEARCH_KEYWORD,
  keyword: kw,
});
const setSearchKeywordRV = getReturnVal(setSearchKeyword);
export type SetSearchKeywordAction = typeof setSearchKeywordRV;

