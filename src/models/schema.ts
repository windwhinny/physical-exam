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
  gendar: FieldType.INTEGER,
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
  gendar: number,
}
