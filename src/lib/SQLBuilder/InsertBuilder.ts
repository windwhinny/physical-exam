import BuilderBase from './BuilderBase';
import {
  SQL,
  JSONValue,
} from '../../definitions/sql';

export default class InsertBuilder extends BuilderBase {
  constructor(tableName: string) {
    super();
    this.init();

    this.setForbiddenMethods([
      'select',
      'where',
      'orderBy',
      'set',
      'from',
      'limt',
    ], 'insert');
    this._tableName = tableName;
  }

  toSQL(): SQL {
    const values: JSONValue[] = [];
    if (!this._tableName) throw new Error('SQLBuilder toSQL needs a tableName');
    if (!this._values) throw new Error('SQLBuilder toSQL needs a updation');
    const result: string[] = [];

    result.push('INSERT INTO', this._tableName);
    this.setInsertion(result, values);

    return {
      text: `${result.join(' ')};`,
      values,
    };
  }
}
