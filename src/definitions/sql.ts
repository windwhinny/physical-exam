import { EventEmitter } from 'events';
/**
 * ORDER BY 排序规则，ASC 或者 DESC
 *
 * @export
 * @enum {number}
 */
export enum Order {
  ASC, // ASC
  DESC, // DESC
}

export type DBValue = number | string | null | Date | boolean;
export type JSONValue = number | string | null | boolean;

/**
 * SimpleObject 只有一层数据，每个子项都是 JS 里的基本数据
 * SimpleObject 没有嵌套对象或者数组
 */
export interface SimpleObject {
  [field: string]: DBValue | void;
}

/**
 * ComplexObject 与 SimpleObject 相似，但允许有嵌套对象或者数组
 */
export interface ComplexObject {
  [field: string]: DBValue | void | ComplexObject | ComplexObject[];
}

export type WhereConditionMap = {
  $lk?: string,
  $gt?: DBValue,
  $ne?: DBValue,
  $lt?: DBValue,
  $lte?: DBValue,
  $gte?: DBValue,
  $in?: DBValue[],
  $nin?: DBValue[],
};

export type WhereConditionValue = {
  [field: string]: DBValue | WhereConditionMap;
};

export type WhereCondition = WhereConditionValue | {
  $or: WhereConditionValue[];
};

export type SQL = {
  /**
   * SQL 语句，用户传入的变量会用 「？」 替代
   */
  text: string,
  /**
   * 用户传入的变量
   */
  values: JSONValue[],
};

export enum FieldType {
  INTEGER = 1,
  TEXT,
  REAL,
  BLOB,
  DATETIME,
}

export type Field = FieldType | {
  type: FieldType,
  autoIncrement?: boolean,
  notNull?: boolean,
  primaryKey?: boolean,
  unique?: boolean,
  default?: DBValue,
};

export type Fields = {
  [name: string]: Field,
};

export type Statement = {
  lastID: number,
  changes: number,
};

export interface DBTransaction extends EventEmitter {
  no?: number;
  promise: Promise<void>;
  end: () => void;
};

export enum DBTransactionOperate {
  BEGIN,
  END,
  ROLLBACK,
}
