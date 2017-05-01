import BuilderBase from './BuilderBase';
import {
  transformValue,
} from '../SQLUtils';
import {
  DBValue,
  Fields,
  JSONValue,
  SQL,
} from '../../definitions/sql';

export default class CreateTableBuilder extends BuilderBase {
  protected _fields: Fields | null = null;
  protected _ifNotExists: boolean = false;
  constructor(tableName: string) {
    super();
    this.init();
    this._tableName = tableName;
  }
  /**
   * 设置表的字段
   *
   * @param {Fields} fields
   * @returns {CreateTableBuilder}
   *
   * @memberOf CreateTableBuilder
   */
  fields(fields: Fields): CreateTableBuilder {
    this._fields = fields;
    return this;
  }

  /**
   * 设置 IF NOT EXISTS 声明
   *
   * @memberOf CreateTableBuilder
   */
  ifNotExists(): CreateTableBuilder {
    this._ifNotExists = true;
    return this;
  }
  /**
   * 返回 SQL 字段描述语段
   *
   * @protected
   * @param {string[]} result
   * @returns
   *
   * @memberOf CreateTableBuilder
   */
  protected setFields(result: string[]) {
    if (this._fields === null) return;
    const fields: Fields = this._fields;
    const strs = Object.keys(this._fields).map(fieldName => {
      const field = fields[fieldName];
      if (typeof field !== 'object') {
        return `\`${fieldName}\` ${this.getFieldTypeDesc(field)}`;
      }

      let dflt: DBValue = null;
      if (typeof field.default !== 'undefined') {
        dflt = transformValue(field.default);
      }
      if (typeof dflt === 'string') {
        dflt = `"${dflt}"`;
      }

      return [
        `\`${fieldName}\``,
        this.getFieldTypeDesc(field.type),
        field.notNull && 'NOT NULL',
        field.primaryKey && 'PRIMARY KEY',
        field.autoIncrement && 'AUTOINCREMENT',
        dflt !== null && `DEFAULT ${dflt}`,
        ].filter(Boolean).join(' ');
    });

    result.push(`(${strs.join(', ')})`);
  }

  toSQL(): SQL {
    const values: JSONValue[] = [];
    if (!this._tableName) throw new Error('SQLBuilder toSQL needs a tableName');
    if (!this.fields) throw new Error('SQLBuilder toSQL needs fields definition');

    const result: string[] = [];
    result.push('CREATE TABLE');
    if (this._ifNotExists) {
      result.push('IF NOT EXISTS');
    }
    result.push(`\`${this._tableName}\``);
    this.setFields(result);

    return {
      text: `${result.join(' ')};`,
      values,
    };
  }
}
