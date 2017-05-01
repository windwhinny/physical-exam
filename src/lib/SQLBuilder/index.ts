import SelectBuilder from './SelectBuilder';
import UpdateBuilder from './UpdateBuilder';
import InsertBuilder from './InsertBuilder';
import BuilderBase from './BuilderBase';
import DeleteBuilder from './DeleteBuilder';
import CreateIndexBuilder from './CreateIndexBuilder';
import CreateTableBuilder from './CreateTableBuilder';
import AlertTableBuilder from './AlertTableBuilder';
import TransactionBuilder from './TransactionBuilder';
import {
  SimpleObject,
} from '../../definitions/sql';

export { SelectBuilder };

/**
 * SQL 语句构建工具
 * # 使用方法
 * ## SELECT
 * ```js
 * const sql = new SQLBuilder.select({
 *  field: 'another',
 * })
 * .from('test')
 * .toSQL();
 * ```
 *
 * 生成的`sql.text`则为：
 * ```SQL
 * SELECT `field` as `another` FROM `test`;
 * ```
 *
 * ## UPDATE
 * ```js
 * const sql = new SQLBuilder.update('test')
 * .set({
 *  field: 1
 * })
 * .where({
 *  id: 2,
 * })
 * .toSQL();
 * ```
 *
 * 生成的 `sql.text` 为：
 * ```SQL
 * UPDATE `test` SET (`field`) VALUES (?) WHERE `id` = ?;
 * ```
 *
 * 生成的 `sql.values` 为：
 * ```json
 * [1, 2]
 * ```
 *
 *
 * @export
 * @class SQLBuilder
 */
export default class SQLBuilder extends BuilderBase {
  constructor() {
    super();
  }
  /**
   * 新建一条 SELECT 语句
   *
   * @param {(string | string[] | SimpleObject)} keys
   * @returns {SQLBuilder}
   *
   * @memberOf SQLBuilder
   */
  select(keys: string | string[] | SimpleObject): SelectBuilder {
    return new SelectBuilder(keys);
  }

  /**
   * 新建一条 UPDATE 语句
   *
   * @param {string} tableName
   * @returns {BuilderBase}
   *
   * @memberOf SQLBuilder
   */
  update(tableName: string): UpdateBuilder {
    return new UpdateBuilder(tableName);
  }

  /**
   * 新建一条 INSERT 语句
   *
   * @param {string} tableName
   * @returns {BuilderBase}
   *
   * @memberOf SQLBuilder
   */
  insertInto(tableName: string): InsertBuilder {
    return new InsertBuilder(tableName);
  }

  /**
   * 新建一条 DELETE 语句
   *
   * @param {string} tableName
   * @returns {BuilderBase}
   *
   * @memberOf SQLBuilder
   */
  deleteFrom(tableName: string): DeleteBuilder {
    return new DeleteBuilder(tableName);
  }

  /**
   * 新建一套 CREATE TABLE 语句
   *
   * @param {string} tableName
   * @returns {BuilderBase}
   *
   * @memberOf SQLBuilder
   */
  createTable(tableName: string): CreateTableBuilder {
    return new CreateTableBuilder(tableName);
  }

  /**
   * 创建一条 CREATE INDEX 语句
   *
   * @param {string} indexName
   * @returns {CreateIndexBuilder}
   *
   * @memberOf SQLBuilder
   */
  createIndex(indexName: string): CreateIndexBuilder {
    return new CreateIndexBuilder(indexName);
  }

  /**
   * 创建一条 ALERT TABLE 语句
   *
   * @param {string} tableName
   * @returns {AlertTableBuilder}
   *
   * @memberOf SQLBuilder
   */
  alertTable(tableName: string): AlertTableBuilder {
    return new AlertTableBuilder(tableName);
  }

  /**
   * 创建一条事务相关的语句
   */
  transaction() {
    return new TransactionBuilder();
  }
}
