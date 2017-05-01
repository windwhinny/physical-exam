import {
  FieldType,
  DBValue,
} from './definitions/sql';

export class DBInvalidTypeError extends Error {
  public field: { name: string, type?: FieldType };
  public tableName: string;
  public value: DBValue | void;

  constructor(args: {
    table: string,
    message: string,
    field: {
      name: string,
      type?: FieldType,
    },
    value: DBValue | void,
  }) {
    super(args.message);
    this.tableName = args.table;
    this.field = args.field;
    this.value = args.value;
  }
}

// tslint:disable-next-line:no-any
(Error.prototype as any).toJSON = function() {
  return JSON.stringify({
    message: this.message,
    stack: this.stack,
  });
}
