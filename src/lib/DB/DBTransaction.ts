import { EventEmitter } from 'events';
import {
  DBTransaction,
} from '../../definitions/sql';

export default class extends EventEmitter implements DBTransaction {
  public promise: Promise<void>;
  private _resolve: () => void;

  constructor(public no?: number) {
    super();
    this.promise = new Promise<void>(resolve => {
      this._resolve = resolve;
    });
    this.setMaxListeners(100);
  }

  end() {
    this._resolve();
  }
  success() {
    this.emit('success');
  }
  faild() {
    this.emit('faild');
  }
}
