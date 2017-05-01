import BuilderBase from './BuilderBase';
import {
  SQL,
  JSONValue,
} from '../../definitions/sql';

export default class DeleteBuilder extends BuilderBase {
  constructor(tableName: string) {
    super();
    this.init();
    this._tableName = tableName;
  }

  toSQL(): SQL {
    const values: JSONValue[] = [];
    if (!this._tableName) throw new Error('SQLBuilder toSQL needs a tableName');

    const result: string[] = [];
    result.push('DELETE FROM', `\`${this._tableName}\``);
    if (this._where) {
      this.setWhereCondition(result, values);
    }

    return {
      text: `${result.join(' ')};`,
      values,
    };
  }
}
