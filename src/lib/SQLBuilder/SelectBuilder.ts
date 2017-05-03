import BuilderBase from './BuilderBase';
import {
  SQL,
  JSONValue,
  SimpleObject,
} from '../../definitions/sql';


export default class SelectBuilder extends BuilderBase {
  _offset: number | null = null;
  distinctField: string[] | null = null;

  constructor(keys: string | string[] | SimpleObject) {
    super();
    this.init();

    this.setForbiddenMethods([
      'update',
      'set',
      'values',
    ], 'insert');

    this.select(keys);
  }

  /**
   * 设置 SELECT 后面跟随的字段
   *
   * @param {(string | string[] | SimpleObject)} keys
   * @returns {SQLBuilder}
   *
   * @memberOf SQLBuilder
   */
  select(keys: string | string[] | SimpleObject): BuilderBase {
    this._selectFields = keys;
    return this;
  }

  /**
   * 声明查找的 TABLE
   *
   * @param {string} tableName
   * @returns {SQLBuilder}
   *
   * @memberOf SQLBuilder
   */
  from(tableName: string): this {
    this._tableName = tableName;
    return this;
  }
  distinct(distinctField: string[]): this {
    this.distinctField = distinctField;
    return this;
  }
  offset(n: number): this {
    this._offset = n;
    return this;
  }
  private setDistinct(field: string[], result: string[]) {
    result.push('SELECT', 'DISTINCT');
    const str = field.map(f => {
      return `\`${f}\``;
    }).join(', ');
    result.push(str);
  }
  /**
   * 生成 SQL 语句
   *
   * @returns {string}
   *
   * @memberOf SQLBuilder
   */
  toSQL(): SQL {
    const values: JSONValue[] = [];
    if (!this._selectFields) throw new Error('SQLBuilder toSQL needs a selection');
    if (!this._tableName) throw new Error('SQLBuilder toSQL needs a tableName');
    const result: string[] = [];

    if (this.distinctField !== null) {
      this.setDistinct(this.distinctField, result);
    } else {
      this.setSelection(result);
    }
    this.setFromTable(result);
    this.setWhereCondition(result, values);
    this.setOrderBy(result);
    this.setLimit(result);

    if (this._offset !== null) {
      result.push('OFFSET', String(this._offset));
    }

    return {
      text: `${result.join(' ')};`,
      values,
    };
  }
}
