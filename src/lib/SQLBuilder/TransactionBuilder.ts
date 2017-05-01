import BuilderBase from './BuilderBase';
import {
  DBTransactionOperate,
  SQL,
} from '../../definitions/sql';


export default class TransactionBuilder extends BuilderBase {
  private opeate: DBTransactionOperate | null = null;
  begin(): this {
    this.opeate = DBTransactionOperate.BEGIN;
    return this;
  }

  end(): this {
    this.opeate = DBTransactionOperate.END;
    return this;
  }

  rollback(): this {
    this.opeate = DBTransactionOperate.ROLLBACK;
    return this;
  }

  toSQL(): SQL {
    const result: string[] = [];
    switch (this.opeate) {
    case DBTransactionOperate.BEGIN:
      result.push('BEGIN', 'TRANSACTION'); break;
    case DBTransactionOperate.END:
      result.push('END', 'TRANSACTION' ); break;
    case DBTransactionOperate.ROLLBACK:
      result.push('ROLLBACK'); break;
    default:
      throw new Error('TRANSACTION sql must call begin, end or rollback');
    }
    return {
      text: `${result.join(' ')};`,
      values: [],
    };
  }
}
