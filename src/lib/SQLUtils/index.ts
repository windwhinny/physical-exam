import {
  SimpleObject,
  JSONValue,
  DBValue,
  WhereCondition,
  WhereConditionMap,
  WhereConditionValue,
} from '../../definitions/sql';
import {
  isString,
  isNumber,
  isDate,
} from '../types';
/**
 * 将值转换成字符串或者数字
 *
 * @export
 * @param {DBValue} value
 * @returns {JSONValue}
 */
export function transformValue(value: DBValue): JSONValue {
  if (value instanceof Date) {
    return value.getTime();
  }
  if (typeof value === 'number' && isNaN(value)) return null;
  return value;
}

/**
 * 设置 where 语句中大于、小于，IN 等关键字
 *
 * @param {string[]} strs
 * @param {string} field
 * @param {WhereConditionMap} map
 * @param {JSONValue[]} values
 * @returns
 */
function setOpeator(
  strs: string[],
  field: string,
  map: WhereConditionMap,
  values: JSONValue[],
) {
  return (operator: keyof WhereConditionMap) => {
    let value = map[operator];
    if (typeof value === 'undefined') return;
    if (isDate(value)) {
      value = value.getTime();
    }
    if (Array.isArray(value)) {
      switch (operator) {
      case '$in':
        if (!Array.isArray(value)) return;
        strs.push(`${field} IN (${value.map(() => '?').join(', ')})`);
        values.push(...value.map(transformValue));
        return;
      case '$nin':
        if (!Array.isArray(value)) return;
        strs.push(`${field} NOT IN (${value.map(() => '?').join(', ')})`);
        values.push(...value.map(transformValue));
        return;
      }
    } else {
      switch (operator) {
      case '$lk':
        values.push(value);
        return strs.push(`${field} LIKE ?`);
      case '$ne':
        values.push(value);
        return strs.push(`${field} != ?`);
      case '$gt':
        values.push(value);
        return strs.push(`${field} > ?`);
      case '$lt':
        values.push(value);
        return strs.push(`${field} < ?`);
      case '$gte':
        values.push(value);
        return strs.push(`${field} <= ?`);
      case '$lte':
        values.push(value);
        return strs.push(`${field} >= ?`);
      }
    }
  };
}

function setConditionSubStr(where: WhereConditionValue, values: JSONValue[]): string {
  const keys = Object.keys(where);
  return keys.reduce((strs: string[], key) => {
    const value = where[key];
    const field = `\`${key}\``;
    if (
      value instanceof Date ||
      value === null ||
      typeof value === 'number' ||
      typeof value === 'string'
    ) {
      values.push(transformValue(value as DBValue));
      strs.push(`${field} = ?`);
    } else {
      Object.keys(value).forEach(setOpeator(strs, field, value, values));
    }
    return strs;
  }, []).join(' AND ');
}

/**
 * 转换 where 设置
 *
 * @export
 * @param {WhereCondition} where
 * @param {string[]} result
 * @param {JSONValue[]} values
 * @returns
 */
export function transformWhereCondition(where: WhereCondition, result: string[], values: JSONValue[]) {
  const keys = Object.keys(where);
  if (!keys.length) return;
  result.push('WHERE');
  let conditionValues = (where as {$or: WhereConditionValue[]})['$or'];
  if (Array.isArray(conditionValues)) {
    const str = conditionValues.map(condition => {
      const subStr = setConditionSubStr(condition, values);
      return `(${subStr})`;
    }).join(' OR ');
    result.push(str);
  } else {
    const subStr = setConditionSubStr(where, values);
    result.push(subStr);
  }
}

/**
 * 判断一份数据是否符合 where 所描述的条件
 *
 * @export
 * @param {SimpleObject} data
 * @param {WhereCondition} where
 * @returns {boolean}
 */
export function isMatchWhereCondition(data: SimpleObject, whereCon: WhereCondition): boolean {
  const isMatchConditionMap = (where: WhereConditionMap, value: DBValue): boolean => {
    return Object.keys(where).reduce((match, key: keyof WhereConditionMap) => {
      if (!match) return false;
      const v = where[key];
      if (key === '$ne') return value !== v;
      if (value === null) value = 0;
      if (isString(v) || isNumber(v)) {
        switch (key) {
        case '$lt': return value < v;
        case '$lte': return value <= v;
        case '$gt': return value > v;
        }
      } else {
        switch (key) {
        case '$in':
          if (Array.isArray(v)) return v.includes(value);
          console.warn(`"where.$in" does not have a Array value, got ${v} compares to ${value}`);
          return true;
        }
      }
      return true;
    }, true);
  };

  const isMatch = (where: WhereConditionValue): boolean => {
    return Object.keys(where).reduce((match, key) => {
      if (!match) return false;
      const v = where[key];
      const value = data[key];
      if (value === v) return true;
      if (typeof value === 'undefined') return false;
      if (isDBValue(v)) return false;
      return isMatchConditionMap(v as WhereConditionMap, value);
    }, true);
  };
  let conditionValues = (whereCon as {$or: WhereConditionValue[]})['$or'];
  if (Array.isArray(conditionValues)) {
    return conditionValues.reduce((match: boolean, whereValue: WhereConditionValue): boolean => {
      if (match) return match;
      return isMatch(whereValue);
    }, false);
  } else {
    return isMatch(whereCon as WhereConditionValue);
  }
}

/**
 * 判断一个值是不是 DBValue 类型
 *
 * @export
 * @param {(Object | void | number | string |)} [data=null | boolean]
 * @returns {boolean}
 */
export function isDBValue(data: Object | void | number | string | null | boolean): boolean {
  if (data === null) return true;
  switch (typeof data) {
  case 'string': return true;
  case 'number': return true;
  case 'boolean': return true;
  }

  if (data instanceof Date) return true;

  return false;
}
