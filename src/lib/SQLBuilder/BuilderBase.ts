import {
  transformWhereCondition,
  transformValue,
} from '../SQLUtils';
import {
  SimpleObject,
  WhereCondition,
  Order,
  DBValue,
  JSONValue,
  Field,
  FieldType,
  SQL,
} from '../../definitions/sql';
export default class BuilderBase {
  protected _selectFields: string| string[] | SimpleObject | null;
  protected _tableName: string | null;
  protected _where: WhereCondition | null;
  protected _limit: number | null;
  protected _orderField: string | null;
  protected _orderBy: Order;
  protected _values: SimpleObject | DBValue[] | null;
  init() {
    this._selectFields = null;
    this._tableName =  null;
    this._where = null;
    this._limit = null;
    this._orderField = null;
    this._values = null;
    this._orderBy = Order.ASC;
  }

  /**
   * 声明查找条件
   *
   * @param {SimpleObject} condition
   * @returns {SQLBuilder}
   *
   * @memberOf SQLBuilder
   */
  where(condition: WhereCondition): BuilderBase {
    this._where = condition;
    return this;
  }

  /**
   * 声明检索范围
   *
   * @param {number} rows
   * @returns {SQLBuilder}
   *
   * @memberOf SQLBuilder
   */
  limit(rows: number): BuilderBase {
    this._limit = rows;
    return this;
  }

  /**
   * 声明排序条件
   */
  orderBy(field: string, order: Order): BuilderBase {
    this._orderField = field;
    this._orderBy = order;
    return this;
  }

  /**
   * 声明更新的字段和其值
   */
  set(values: SimpleObject): BuilderBase {
    this._values = values;
    return this;
  }

  /**
   * 声明需要插入的值
   *
   * @param {SimpleObject} values
   * @returns {BuilderBase}
   *
   * @memberOf BuilderBase
   */
  values(values: SimpleObject | DBValue[]): BuilderBase {
    this._values = values;
    return this;
  }

  /**
   * 设置对象禁用的方法，如：
   * ```
   * this.setForbiddenMethods(['select'], 'insert');
   * this.select();
   * // Error: cannot use "select" with "insert"
   * ```
   *
   * @protected
   * @param {string[]} methods
   * @param {string} selfName
   *
   * @memberOf BuilderBase
   */
  protected setForbiddenMethods(methods: string[], selfName: string) {
    // tslint:disable-next-line:no-any
    const props: any = {};
    methods.forEach(method => {
      props[method] = {
        get: () => () => {
          throw new Error(`cannot use "${method}" with "${selfName}"`);
        },
      };
    });

    Object.defineProperties(this, props);
  }

  /**
   * 生成 SELECT 语段
   *
   * @protected
   * @param {string[]} result
   * @returns
   *
   * @memberOf BuilderBase
   */
  protected setSelection(result: string[]) {
    if (this._selectFields === null) {
      return;
    }
    result.push('SELECT');
    if (Array.isArray(this._selectFields)) {
      result.push(this._selectFields.map(field => `\`${field}\``).join(', '));
    } else if (typeof this._selectFields === 'object') {
      const fields: SimpleObject = this._selectFields;
      result.push(Object
        .keys(fields)
        .map(field => `\`${field}\` as \`${fields[field]}\``)
        .join(', '));
    } else if (this._selectFields === '*') {
      result.push('*');
    } else {
      result.push(`\`${this._selectFields}\``);
    }
  }

  /**
   * 设置 FROM 语段
   *
   * @protected
   * @param {string[]} result
   * @returns
   *
   * @memberOf BuilderBase
   */
  protected setFromTable(result: string[]) {
    if (!this._tableName) {
      return;
    }
    result.push('FROM');
    result.push(`\`${this._tableName}\``);
  }

  /**
   * 设置 WHERE 语段
   *
   * @protected
   * @param {string[]} result
   * @param {DBValue[]} values
   * @returns
   *
   * @memberOf BuilderBase
   */
  protected setWhereCondition(result: string[], values: JSONValue[]) {
    if (this._where === null) return;
    transformWhereCondition(this._where, result, values);
  }

  /**
   * 设置 ORDER BY 语段
   *
   * @protected
   * @param {string[]} result
   * @returns
   *
   * @memberOf BuilderBase
   */
  protected setOrderBy(result: string[]) {
    if (this._orderField === null) return;
    result.push(
      'ORDER BY',
      `\`${this._orderField}\``,
      this._orderBy === Order.ASC ? 'ASC' : 'DESC',
      );
  }
  /**
   * 获取字段类型对应的 SQL 描述
   *
   * @protected
   * @param {FieldType} fieldType
   * @returns {string}
   *
   * @memberOf BuilderBase
   */
  protected getFieldTypeDesc(field: Field): string {
    let fieldType: FieldType;
    if (typeof field === 'object') {
      fieldType = field.type;
    } else {
      fieldType = field;
    }

    if (typeof fieldType === 'undefined') {
      throw new Error('fiel type must be set');
    }

    switch (fieldType) {
    case FieldType.BLOB:
      return 'BLOB';
    case FieldType.INTEGER:
      return 'INTEGER';
    case FieldType.REAL:
      return 'REAL';
    case FieldType.TEXT:
      return 'TEXT';
    case FieldType.DATETIME:
      return 'DATETIME';
    default:
      throw new Error(`unsupport field type: ${fieldType}`);
    }
  }

  /**
   * 设置 LIMIT 语段
   *
   * @protected
   * @param {string[]} result
   * @returns
   *
   * @memberOf BuilderBase
   */
  protected setLimit(result: string[]) {
    if (this._limit === null) return;
    result.push('LIMIT', String(this._limit));
  }

  /**
   * 设置 SET 语段
   *
   * @protected
   * @param {string[]} result
   * @param {DBValue[]} values
   * @returns
   *
   * @memberOf BuilderBase
   */
  protected setUpdation(result: string[], values: JSONValue[]) {
    if (!this._values) return;
    const updation: SimpleObject = this._values as SimpleObject;

    // 如果字段的值为 undefined 则自动忽略该字段
    const keys = Object.keys(updation).map(key => {
      const value = updation[key];
      if (typeof value === 'undefined') return null;
      return key;
    }).filter(Boolean) as string[];

    if (!keys.length) return;

    result.push('SET');
    result.push(`(${keys.map(key => `\`${key}\``).join(', ')})`);
    result.push('=');
    result.push(`(${keys.map(() => '?').join(', ')})`);

    keys.forEach(key => {
      if (!updation) return;
      values.push(transformValue(updation[key] as DBValue));
    });
  }

  /**
   * 设置 INSERT INTO 后面跟随的值语段
   *
   * @protected
   * @param {string[]} result
   * @param {DBValue[]} values
   * @returns
   *
   * @memberOf BuilderBase
   */
  protected setInsertion(result: string[], values: JSONValue[]) {
    if (!this._values) return;

    let insertion = this._values as SimpleObject | DBValue[];

    if (Array.isArray(insertion)) {
      // 替换掉数组里的 undefined 数据
      insertion = insertion.map(value => typeof value === 'undefined' ? null : value);
      if (!insertion.length) return;
      result.push('VALUES');
      result.push(`(${insertion.map(() => '?').join(', ')})`);
      values.push(...insertion.map(transformValue));
    } else {
      // 过滤掉值为 undefined 的字段
      const keys = Object.keys(insertion).map(key => {
        // tslint:disable-next-line:no-any
        if (typeof (insertion as any)[key] === 'undefined') return null;
        return key;
      }).filter(Boolean) as string[];

      if (!keys.length) return;
      result.push(`(${keys.map(key => `\`${key}\``).join(', ')})`);
      result.push('VALUES');
      result.push(`(${keys.map(() => '?').join(', ')})`);
      // tslint:disable-next-line:no-any
      values.push(...keys.map(key => transformValue((insertion as any)[key])));
    }
  }

  /**
   * 生成 SQL 语句
   *
   * @returns {string}
   *
   * @memberOf SQLBuilder
   */
  toSQL(): SQL {
    throw new Error('call select/update/insert/create first');
  }
}
