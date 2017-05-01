import { EventEmitter } from 'events';
import SQLBuilder from '../../lib/SQLBuilder';
import DBTransaction from './DBTransaction';
import {
  SQL,
  Statement,
  DBTransaction as TeansactionInterface,
} from '../../definitions/sql';
/**
 * DB 的抽象父类，主要实现了事务功能
 */
abstract class BaseDB extends EventEmitter {
  private transactionNo: number = 1;
  private waitingDBTransaction: TeansactionInterface | null = null;

  /**
   * 等待一个事务执行完毕
   * 如果 t 就是当前正在执行的事务，则直接通过，不需等待
   */
  protected awaitDBTransaction(t?: TeansactionInterface): Promise<void> | void {
    if (!this.waitingDBTransaction) return;
    if (t && t.no === this.waitingDBTransaction.no) return;
    return this.waitingDBTransaction.promise;
  }

  /**
   * 清除当前正在执行的事务状态
   */
  private clearWaitingDBTransaction() {
    this.waitingDBTransaction = null;
  }

  /**
   * 创建一个事务，在参数 `runner` 中执行各项 sql 请求，并返回各项请求的 Promise
   * 如果其中一个请求失败，则会触发 `roll back`
   * 全部请求成功之后则会将事务 `commit`
   * ```js
   * db.transaction(t => [
   *  db.run(...),
   *  db.update(...)
   * ])
   * .then(() => {
   *    // 请求成功，事务被 commit
   * }, err => {
   *    // 请求失败，事务被 roll back
   * })
   * ```
   */
  // tslint:disable-next-line:no-any
  async transaction(runner: (t: TeansactionInterface) => Promise<any>[]): Promise<any[]> {
    await this.awaitDBTransaction();
    const sql = new SQLBuilder().transaction().begin().toSQL();
    const t = new DBTransaction(this.transactionNo++);
    this.waitingDBTransaction = t;
    await this.run(sql, t);
    // tslint:disable-next-line:no-any
    let result: any[];
    try {
      result = await Promise.all(runner(t));
    } catch (e) {
      // 如果失败的话，执行 rollback, 并抛出异常
      t.faild();
      await this.run(new SQLBuilder().transaction().rollback().toSQL(), t);
      this.clearWaitingDBTransaction();
      t.end();
      throw e;
    }

    t.success();
    // 如果成功的话，执行 transaction commit, 并返回结果
    await this.run(new SQLBuilder().transaction().end().toSQL(), t);
    this.clearWaitingDBTransaction();
    t.end();
    return result;
  }

  abstract async run(sql: SQL, t?: DBTransaction): Promise<Statement>;
}

export default BaseDB;
