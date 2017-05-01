import Model from '../lib/Model';
import {
  DBInterface,
} from '../definitions/services';

import { RecordModelSchema } from './schema';

export * from './schema';

export default class RecordModel extends Model {
  constructor(db: DBInterface) {
    super('records', RecordModelSchema, db, false);
  }
};
