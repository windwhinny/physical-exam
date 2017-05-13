import {
  FieldType,
} from '../definitions/sql';

export const RecordModelSchema = {
  uuid: {
    type: FieldType.TEXT,
    primaryKey: true,
    unique: true,
  },
  stuNo: FieldType.TEXT,
  stuName: FieldType.TEXT,
  item: FieldType.TEXT,
  score: FieldType.TEXT,
  result: FieldType.INTEGER,
  testTime: FieldType.DATETIME,
  synced: FieldType.INTEGER,
  date: FieldType.TEXT,
  gender: FieldType.INTEGER,
  ip: FieldType.TEXT,
  sign: FieldType.TEXT,
}

export type RecordPO = {
  uuid?: string,
  stuNo: string,
  stuName: string,
  item: string,
  score: string,
  result: number,
  testTime: Date,
  synced: number,
  date: string,
  gender: number,
  ip: string,
  sign: string,
}
