import BuilderBase from './BuilderBase';
import {
  SQL,
  JSONValue,
} from '../../definitions/sql';

export default class UpdateBuilder extends BuilderBase {
  constructor(tableName: string) {
    super();
    this.init();

    this.setForbiddenMethods([
      'select',
      'values',
      'orderBy',
      'limt',
    ], 'insert');
    this.update(tableName);
  }

  /**
   * 声明需要更新的 TABLE
   * 
   * @param {string} tableName
   * @returns {BuilderBase}
   * 
   * @memberOf BuilderBase
   */
  update(tableName: string): BuilderBase {
    this._tableName = tableName;
    return this;
  }

  toSQL(): SQL {
    const values: JSONValue[] = [];
    if (!this._tableName) throw new Error('SQLBuilder toSQL needs a tableName');
    if (!this._values || !Object.keys(this._values).length) {
      throw new Error('SQLBuilder toSQL needs a updation');
    }
    if (!this._where || !Object.keys(this._where).length) {
      throw new Error('SQLBuilder toSQL needs a where condition');
    }
    const result: string[] = [];
    result.push('UPDATE', this._tableName);
    this.setUpdation(result, values);
    this.setWhereCondition(result, values);
    this.setLimit(result);

    return {
      text: `${result.join(' ')};`,
      values,
    };
  }
}
