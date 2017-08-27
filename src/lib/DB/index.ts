import { app } from 'electron';
import path = require('path');
import sqlite = require('sqlite3');
import fs = require('fs');
import {
  SQL,
  SimpleObject,
  Statement,
  DBTransaction,
} from '../../definitions/sql';
import {
  DBInterface
} from '../../definitions/services';
import BaseDB from './BaseDB';

export default class DB extends BaseDB implements DBInterface {
  db: sqlite.Database | null;
  dbfile = path.join(app.getPath('userData'), 'data.db');
  backupDBfile = path.join(app.getPath('userData'), 'data.db.bak');
  initPromise: Promise<sqlite.Database>;
  closed: boolean;

  backup() {
    fs.stat(this.dbfile, (err, stats) => {
      if (err) return;
      if (stats.isFile()) {
        const readStream = fs.createReadStream(this.dbfile);
        const writeStream = fs.createWriteStream(this.backupDBfile);
        readStream.pipe(writeStream);
      }
    });
  }

  async open(): Promise<{}>  {
    if (this.db) {
      await new Promise((resolve, reject) => {
        if (!this.db) throw new Error('db not inited');
        this.db.close(err => {
          if (err) return reject(err);
          resolve();
        })
      });
    }
    return await new Promise((resolve, reject) => {
      const _db = new sqlite.Database(this.dbfile, err => {
        if (err) return reject(err);
        this.db = _db;
        this.backup();
        resolve();
      });
    });
  }
  close() {
    return new Promise<void>((resolve, reject) => {
      if (!this.db) return resolve();
      this.db.close(err => {
        if (err) return reject(err);
        this.db = null;
        this.closed = true;
        resolve();
      });
    });
  }

  async run(sql: SQL, t?: DBTransaction) {
    await this.initPromise;
    await this.awaitDBTransaction(t);
    return await new Promise((resolve, reject) => {
      if (!this.db) throw new Error('db not inited');
      console.info('RUN SQL', sql.text, sql.values);
      this.db.run(sql.text, sql.values, function (err) {
        if (err) return reject(err);
        // tslint:disable-next-line:no-any
        resolve(this);
      });
    }) as Promise<Statement>;
  }

  async all(sql: SQL, t?: DBTransaction) {
    await this.initPromise;
    await this.awaitDBTransaction(t);
    return await new Promise((resolve, reject) => {
      if (!this.db) throw new Error('db not inited');
      console.info('ALL SQL', sql.text, sql.values);
      this.db.all(sql.text, sql.values, function (err, rows) {
        if (err) return reject(err);
        // tslint:disable-next-line:no-any
        resolve(rows || []);
      });
    }) as Promise<SimpleObject[]>;
  }
}
