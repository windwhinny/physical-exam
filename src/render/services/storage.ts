import {
  bindMethod,
} from '../../lib/utils';

type RecordPO = {
  uuid: string,
  stuNo: string,
  stuName: string,
  item: string,
  score: string,
  result: number,
  testTime: number,
}

class Storage {
  db: IDBDatabase;
  constructor() {
    bindMethod(this, ['onUpgrade']);
  }

  open() {
    return new Promise((resolve, reject) => {
      const request = (indexedDB.open('score'));
      request.onerror = (err: Event) => {
        reject(err);
      };
      request.onsuccess = () => {
        resolve(request.result);
      };
      request.onupgradeneeded = this.onUpgrade;
    })
  }

  onUpgrade(e: Event) {
    const db = (e.target as any).result as IDBDatabase;
    const store = db.createObjectStore('score', {
      keyPath: 'uuid',
    });

    store.createIndex('')
  }
}

export default new Storage();
