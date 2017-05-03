import SQLBuilder from '../SQLBuilder';
import BaseModel from './BaseModel';
import Cache from './Cache';
import {
  isMatchWhereCondition,
} from '../SQLUtils';

import {
  DBValue,
  SimpleObject,
  ComplexObject,
  WhereCondition,
  Order,
  DBTransaction,
} from '../../definitions/sql';

export type FindResult = {
  data: SimpleObject[],
};

/**
 * 数据库 Model，包含缓存、数据校验功能
 *
 * @export
 * @class Model
 * @extends {EventEmitter}
 */
export default class Model extends BaseModel {

  /**
   * 向数据库同步表结构
   *
   * @returns {Promise<void>}
   *
   * @memberOf Model
   */
  async sync(): Promise<void> {
    const sql = new SQLBuilder()
                    .createTable(this.tableName)
                    .ifNotExists()
                    .fields(this.schema)
                    .toSQL();
    this.initialization = this.db.run(sql).then(() => {
      this.initialization = null;
    });
    // 依次初始化子 model
    for (const rel of this.eachSubModel()) {
      await (rel.model as Model).sync();
    }
    await this.initialization;
    // 表格创建之后，将 schema 设置为只读
    this.schema = this.schema;
  }

  /**
   * 插入一条数据
   *
   * @param data 需要插入的单条数据
   * @param t 事务句柄
   *
   * @memberOf Model
   */
  async insert(data: ComplexObject, t?: DBTransaction, ignoreDataCheck: boolean = false): Promise<ComplexObject> {
    let selfData = data as SimpleObject;
    if (!ignoreDataCheck) {
      selfData = this.checkData(data);
    }
    const sql = new SQLBuilder().insertInto(this.tableName).values(selfData).toSQL();
    await this.initialization;
    const statement = await this.db.run(sql, t);
    selfData = this.fillUpValue(selfData, statement);
    this.insertIntoCache(selfData, t);
    const newData = selfData as ComplexObject;
    for (let rel of this.eachSubModel()) {
        const subData = data[rel.asField] as SimpleObject[];
        if (Array.isArray(subData)) {
          newData[rel.asField] = await (rel.model as Model).insertMulti(subData, t);
        }
    }
    return newData;
  }

  /**
   * 多条插入,
   * 其中只要有一条数据检查不通过，则全部不会插入
   * @param data 需要插入的多条数据
   * @param t 事务句柄
   */
  insertMulti(data: SimpleObject[], t?: DBTransaction): Promise<SimpleObject[]> {
    try {
      data.map(d => this.checkData(d));
    } catch (e) {
      return Promise.reject(e);
    }
    return Promise.all(data.map(d => this.insert(d, t, true)));
  }


  /**
   * 查找数据
   *
   * @param {{
   *     where?: WhereCondition,
   *     limit?: number,
   *     groupBy?: {
   *       field: string,
   *       order: GroupByOrder,
   *     },
   *     attrs?: string[],
   *   }} [options] 指定查询条件、排序规则、查询限制以及查找字段
   *
   * @memberOf Model
   */
  async find(options?: {
    where?: WhereCondition,
    limit?: number,
    offset?: number,
    orderBy?: {
      field: string,
      order: Order,
    },
    distinct?: string[],
    attrs?: string[],
  }, t?: DBTransaction): Promise<SimpleObject[]> {
    options = options || {};
    const selection = options.attrs || '*';

    const builder = new SQLBuilder()
      .select(selection)
      .from(this.tableName);

    if (options.where) {
      builder.where(options.where);
    }

    if (options.orderBy) {
      builder.orderBy(options.orderBy.field, options.orderBy.order);
    }

    if (options.limit) {
      builder.limit(options.limit);
    }

    if (options.offset) {
      builder.offset(options.offset);
    }

    if (options.distinct) {
      builder.distinct(options.distinct);
    }

    await this.initialization;
    const result = await this.db.all(builder.toSQL(), t);
    const uniqueKey = this.uniquePrimaryKey;
    if (selection === '*' && uniqueKey && this.cache && result) {
      const temp: {[k: string]: SimpleObject} = {};
      result.forEach(data => {
        const id = data[uniqueKey];
        const idStr = id ? id.toString() : 'null';
        temp[idStr] = data;
      });

      this.cache.updateAll(temp, t);
    }

    return result.map<SimpleObject>(this.transformValue.bind(this));
  }

  /**
   * 获取指定查询条件的一条记录
   *
   * @param options
   * @returns {(Promise<SimpleObject | null)}
   *
   * @memberOf Model
   */
  findOne(options?: {
    where?: WhereCondition,
    orderBy?: {
      field: string,
      order: Order,
    },
    attrs?: string,
  }, t?: DBTransaction): Promise<SimpleObject | null> {
    return this.find(Object.assign({}, options, {
      limit: 1,
    }), t).then(result => {
      if (result.length) {
        return result[0];
      };
      return null;
    });
  }

  /**
   * 通过外键获取数据
   * @param field 关联的外键
   * @param value 外键的值
   */
  async getByForeignKey(field: string, value: DBValue | DBValue[], t?: DBTransaction): Promise<SimpleObject[]> {
    let result: SimpleObject[] = [];
    let faildToFound: DBValue[] = [];
    if (!Array.isArray(value)) {
      value = [value];
    }

    if (this.cache) {
      const cache = this.cache;
      result = value.reduce((r: SimpleObject[], v) => {
        const data = cache.getByIndex(field, v);
        if (data) {
          r = r.concat(data);
        } else {
          faildToFound.push(v);
        }
        return r;
      }, []);
    } else {
      faildToFound = value;
    }
    if (faildToFound.length) {
      result = result.concat(await this.find({
        where: {
          [field]: { $in: faildToFound },
        },
      }, t));
    }
    return result;
  }

  /**
   * 根据 id 获取指定条目的完整信息。
   * 其中 id 是 Schema 中第一个为 unique primary key 的字段
   *
   * @param id
   * @param full 时候将关联的数据都携带上
   * @returns {(Promise<SimpleObject | null)}
   * @readonly
   *
   * @memberOf Model
   */
  async getById(id: DBValue, full: boolean = true, t?: DBTransaction): Promise<ComplexObject | null> {
    let result: ComplexObject | null = null;
    let baseResult: SimpleObject | null = null;
    if (this.cache) {
      baseResult = this.cache.get(id);
    }

    if (baseResult === null) {
      const sql = new SQLBuilder()
        .select('*')
        .from(this.tableName)
        .where({
          [this.uniquePrimaryKey]: id,
        })
        .limit(1)
        .toSQL();

      await this.initialization;
      const queryResult = await this.db.all(sql, t);
      baseResult = (queryResult && queryResult[0]) || null;
      if (this.cache && baseResult) {
        (this.cache as Cache).update(baseResult[this.uniquePrimaryKey] || null, baseResult, t);
      }
    }

    // 获取 sub model 的数据
    if (baseResult !== null && full) {
      result = Object.assign({}, baseResult);
      for (let rel of this.eachSubModel()) {
        const foreignKey = baseResult[this.uniquePrimaryKey];
        if (typeof foreignKey === 'undefined' || foreignKey === null) continue;
        result[rel.asField] = await (rel.model as Model).getByForeignKey(rel.refField, foreignKey, t);
      }
    } else {
      result = baseResult;
    }

    return result;
  }
  /**
   * 根据查询条件获取条目的完整信息
   */
  async findWithSubModel(options: {
    where?: WhereCondition,
    limit?: number,
    orderBy?: {
      field: string,
      order: Order,
    },
  }, t?: DBTransaction): Promise<ComplexObject[]> {
    const data = await this.find(options, t) as ComplexObject[];
    if (!data.length) return data;
    const map: Map<DBValue, ComplexObject> = new Map();

    const ids = data.map(d => {
      const id = d[this.uniquePrimaryKey] as DBValue;
      if (typeof id === 'undefined' || id === null) return null;
      // model.find 返回的是只读数据，这里必须浅拷贝一次
      map.set(id, Object.assign({}, d));
      return id;
    }).filter(Boolean);

    for (let rel of this.eachSubModel()) {
      const subData = await (rel.model as Model).getByForeignKey(rel.refField, ids, t);
      // 给所有的子 model 设置默认值
      for (const d of map.values()) {
        d[rel.asField] = [];
      }
      subData.forEach(sub => {
        const id = sub[rel.refField] as DBValue;
        const d = map.get(id);
        if (!d) return;
        const subs = d[rel.asField] as SimpleObject[];
        subs.push(sub);
      });
    };

    const result: ComplexObject[] = [];
    for (const v of map.values()) {
      result.push(v);
    };
    return result;
  }

  /**
   * 根据条件，删除数据库中的数据
   * 如果开启缓存的话，会先去查找需要删除的字段 id，再执行 DELETE 语句之后将缓存里的 id 相应的数据删除
   *
   * @param {WhereCondition} where
   * @returns {(Promise<void>)}
   *
   * @memberOf Model
   */
  async delete(where: WhereCondition, t?: DBTransaction): Promise<void> {
    const run = async (_t: DBTransaction) => {
      const sql = new SQLBuilder()
        .select(this.uniquePrimaryKey)
        .from(this.tableName)
        .where(where)
        .toSQL();
        // 首先根据查询条件查找需要被删除的数据 id
        const ids = (await this.db.all(sql, _t)).map(r => r[this.uniquePrimaryKey]) as DBValue[];
        if (!ids || !ids.length) return;
        await this.db.run(new SQLBuilder()
          .deleteFrom(this.tableName)
          .where({
            [this.uniquePrimaryKey]: {
              $in: ids,
            },
          })
          .toSQL(), _t);

        ids.forEach(id => {
          if (this.cache) {
            // 删除缓存数据
            this.cache.delete(id, _t);
          }
        });
        // 删除 subMode 的数据
        for (let rel of this.eachSubModel()) {
          (rel.model as Model).deleteByForeignKeys(rel.refField, ids, _t);
        }
    };
    await this.initialization;
    if (t) {
      await run(t);
    } else {
      await this.db.transaction(_t => [run(_t)]);
    }
  }

  async deleteById(id: DBValue, t?: DBTransaction): Promise<void> {
    const primaryKey = this.uniquePrimaryKey;
    const sql = new SQLBuilder()
      .deleteFrom(this.tableName)
      .where({
        [primaryKey]: id,
      })
      .toSQL();

    await this.initialization;
    await this.db.run(sql, t);
    if (this.cache) {
      this.cache.update(id, null, t);
      for (let rel of this.eachSubModel()) {
        (rel.model as Model).deleteByForeignKeys(rel.refField, [id], t);
      }
    }
  }
  /**
   * 根据外键删除数据
   */
  async deleteByForeignKeys(foreignKey: string, values: DBValue[], t?: DBTransaction): Promise<void> {
    const sql = new SQLBuilder()
      .deleteFrom(this.tableName)
      .where({
        [foreignKey]: {$in: values},
      })
      .toSQL();

    await this.initialization;
    await this.db.run(sql, t);
    if (this.cache) {
      this.cache.deleteByForeignKeys(foreignKey, values, t);
    }
  }

  /**
   * 更新数据时，先更新数据库，再更新缓存
   * @param updation
   * @param where
   *
   * @memberOf Model
   */
  async update(updation: SimpleObject, where: WhereCondition, t?: DBTransaction) {
    const sql = new SQLBuilder()
      .update(this.tableName)
      .set(updation)
      .where(where)
      .toSQL();

    await this.initialization;
    await this.db.run(sql, t);

    if (this.cache) {
      for ( let [id, data] of this.cache.forEach()) {
        if (isMatchWhereCondition(data, where)) {
          data = Object.assign(data, updation);
          this.cache.update(id, data, t);
        }
      }
    }
  }

  /**
   * 与 {@link BaseDB} 的 transaction 方法一致
   */
  // tslint:disable-next-line:no-any
  transaction(...args: any[]) {
    return this.db.transaction.apply(this.db, args);
  }
}
