import BuilderBase from './BuilderBase';
import {
  Field,
  SQL,
  JSONValue,
} from '../../definitions/sql';

export default class AlertTableBuilder extends BuilderBase {
  protected renameToTable: string | null = null;
  protected field: Field | null = null;
  protected fieldName: string | null = null;
  constructor(tableName: string) {
    super();
    this._tableName = tableName;
  }

  renameTo(tableName: string): AlertTableBuilder {
    this.renameToTable = tableName;
    return this;
  }

  addColumn(fieldName: string, field: Field): AlertTableBuilder {
    this.fieldName = fieldName;
    this.field = field;
    return this;
  }

  toSQL(): SQL {
    const values: JSONValue[] = [];
    if (!this._tableName) throw new Error('SQLBuilder toSQL needs a tableName');
    if (!this.renameToTable && !this.field) throw new Error('SQLBuilder toSQL needs rename or addColumn called');
    const result: string[] = [];
    result.push('ALERT TABLE', `\`${this._tableName}\``);
    if (this.renameToTable) {
      result.push('RENAME TO', `\`${this.renameToTable}\``);
    } else if (this.field) {
      result.push('ADD COLUMN', `\`${this.fieldName}\` ${this.getFieldTypeDesc(this.field)}`);
    }

    return {
      text: `${result.join(' ')};`,
      values,
    };
  }
}
