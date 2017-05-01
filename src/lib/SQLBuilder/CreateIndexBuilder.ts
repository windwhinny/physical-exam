import BuilderBase from './BuilderBase';
import {
  SQL,
  JSONValue,
} from '../../definitions/sql';
export default class CreateIndexBuilder extends BuilderBase {
  protected fieldNames: string[] | null = null;
  constructor(
    protected indexName: string,
    protected unique: boolean = false,
    protected ifNotExists: boolean = true,
  ) {
    super();
  }

  /**
   * 指定需要添加索引的表
   *
   * @param {string} tableName
   * @returns {CreateIndexBuilder}
   *
   * @memberOf CreateIndexBuilder
   */
  on(tableName: string): CreateIndexBuilder {
    this._tableName = tableName;
    return this;
  }

  /**
   * 指定需要加入索引的字段名
   *
   * @param {string[]} fieldNames
   * @returns {CreateIndexBuilder}
   *
   * @memberOf CreateIndexBuilder
   */
  fields(fieldNames: string[]): CreateIndexBuilder {
    this.fieldNames = fieldNames;
    return this;
  }

  toSQL(): SQL {
    const values: JSONValue[] = [];
    if (!this.indexName) throw new Error('SQLBuilder toSQL needs a indexName');
    if (!this._tableName) throw new Error('SQLBuilder toSQL needs a tableName');
    if (!this.fieldNames || !this.fieldNames.length) throw new Error('SQLBuilder toSQL needs fieldNames');

    const result: string[] = [];
    if (this.unique) {
      result.push('CREATE UNIQUE INDEX');
    } else {
      result.push('CREATE INDEX');
    }

    if (this.ifNotExists) {
      result.push('IF NOT EXISTS');
    }
    result.push(`\`${this.indexName}\``);
    result.push(`ON \`${this._tableName}\``);
    result.push(`(${this.fieldNames.map(field => `\`${field}\``).join(', ')})`);
    return {
      text: `${result.join(' ')};`,
      values,
    };
  }
}
