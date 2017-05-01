import { EventEmitter } from 'events';
import {
  DBValue,
  Fields,
  SimpleObject,
  DBTransaction,
} from '../../../definitions/sql';

export type CacheDataMap = Map<DBValue, SimpleObject>;

export type CacheData = {
  [key: string]: SimpleObject,
};

export type CacheIndexs = {
  [field: string]: Map < DBValue, DBValue[] >,
};

/**
 * Cache 用于实现 Model 的缓存，有事务和索引功能
 * 只提供最基本的获取、更新、遍历的实现
 */
export default class Cache extends EventEmitter {
  public data: CacheDataMap;
  public indexs: CacheIndexs = {};

  constructor(
    public tableName: string,
    public schema: Fields,
    public primaryKey: string,
  ) {
    super();
    this.data = new Map();
  }

  /**
   * 更新缓存，支持事务
   */
  update(id: DBValue, data: SimpleObject | null | undefined, t?: DBTransaction) {
    const oldData = this.get(id);
    if (data === oldData) return;
    this.clearIndexByData(oldData);
    if (!data) {
      this.data.delete(id);
    } else {
      this.data.set(id, data);
      this.updateIndexByData(data);
    }

    if (t) {
      t.once('faild', () => {
        // 如果事务失败，则回滚数据
        this.update(id, oldData);
        this.clearIndexByData(data as SimpleObject);
        if (oldData) {
          this.updateIndexByData(oldData);
        }
      });
    }
  }

  delete(id: DBValue, t?: DBTransaction) {
    return this.update(id, null, t);
  }

  /**
   * 根据外键删除数据
   */
  deleteByForeignKeys(forigenKey: string, values: DBValue[], t?: DBTransaction) {
    const map = this.indexs[forigenKey];
    if (!map) return;
    values.forEach(value => {
      const ids = map.get(value);
      if (!ids) return;
      ids.forEach(id => this.update(id, null, t));
    });
  }

  /**
   * 批量更新缓存，支持事务
   */
  updateAll(data: CacheData, t?: DBTransaction) {
    Object.keys(data).forEach(key => {
      this.update(key, data[key], t);
    });
  }

  /**
   * 增量更新数据，如果数据不存在，则直接返回
   */
  incrementUpdate(id: DBValue, data: SimpleObject, t?: DBTransaction) {
    const oldData = this.get(id);
    if (!oldData) return;
    return this.update(id, Object.assign({}, oldData, data), t);
  }

  /**
   * 获取缓存
   */
  get(id: DBValue): SimpleObject | null {
    const value = this.data.get(id);
    if (typeof value === 'undefined') {
      return null;
    } else {
      return value;
    }
  }

  /**
   * 根据索引获取数据
   */
  getByIndex(field: string, value: DBValue): SimpleObject[] | null {
    const indexMap = this.indexs[field];
    if (!indexMap) return null;
    const ids = indexMap.get(value);
    if (!ids) return null;
    return ids.reduce((result: SimpleObject[], id: DBValue) => {
      const v = this.get(id);
      if (v) result.push(v);
      return result;
    }, []);
  }

  /**
   * 设置需要被索引的字段，设置索引之后，索引将会和数据的主键关联起来
   */
  setIndex(field: string) {
    this.indexs[field] = new Map();
  }

  /**
   * 清除数据对应的索引信息
   * @param data 数据需要包含完整的字段，对应的索引才会被清除
   */
  clearIndexByData(data: SimpleObject | null) {
    if (!data) return;
    const primaryKey = data[this.primaryKey];
    if (!primaryKey) return;
    Object.keys(this.indexs).forEach(key => {
      const index = this.indexs[key];
      if (!index) return;
      const value = data[key];
      if (typeof value !== 'undefined' && value !== null) {
        const list = index.get(value);
        if (!list) return;
        const i = list.indexOf(primaryKey);
        if (i < 0) return;
        list.splice(i, 1);
      }
    });
  }

  /**
   * 根据数据更新索引
   */
  updateIndexByData(data: SimpleObject | null) {
    if (!data) return;
    const primaryKey = data[this.primaryKey];
    if (!primaryKey) return;
    Object.keys(this.indexs).forEach(key => {
      const index = this.indexs[key];
      if (!index) return;
      const value = data[key];
      if (typeof value !== 'undefined' && value !== null) {
        let list = index.get(value);
        if (list) {
          const i = list.indexOf(primaryKey);
          if (i >= 0) return;
        } else {
          list = [];
        }
        list.push(primaryKey);
        index.set(value, list);
      }
    });
  }

  /**
   * 提供遍历接口，因为可能要支持异步场景，所以用 Gentator Function
   */
  *forEach() {
    for (let data of this.data) {
      yield data;
    }
  }
};
