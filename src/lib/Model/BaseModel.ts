import { EventEmitter } from 'events';
import Cache from './Cache';
import { DBInvalidTypeError } from '../../errors';
import {
  isDate,
} from '../types';
import {
  Fields,
  DBValue,
  Field,
  FieldType,
  SimpleObject,
  Statement,
  DBTransaction,
  ComplexObject,
} from '../../definitions/sql';
import {
  DBInterface,
} from '../../definitions/services';

enum RelationType {
  BELONGS_TO,
  HAS_MANY,
};

type Relation = {
  type: RelationType,
  model: BaseModel,
  asField: string,
  refField: string,
};

export default class BaseModel extends EventEmitter {
  public cache: Cache | null = null;
  public uniquePrimaryKey: string;
  public relations: Relation[] = [];
  /**
   * 用来维持 Model 初始化的状态，在初始化执行完成之前，任何查询操作都会放置在初始化完成之后执行
   */
  protected initialization: Promise<void> | null = null;

  /**
   * Creates an instance of Model.
   *
   * @param {string} tableName 表名
   * @param {Fields} schema 数据库结构
   * @param {DB} db 数据库连接
   * @param {boolean} [caching=true] 是否需要开启缓存
   *
   * @memberOf Model
   */
  constructor(
    public tableName: string,
    public schema: Fields,
    public db: DBInterface,
    public caching: boolean = true,
  ) {
    super();

    // 查找 schema 中为 unique 且为 primary key 的字段
    const uniquePrimaryKey = Object.keys(schema).reduce((result: string | null, fieldName: string) => {
      if (result) return result;
      const field = schema[fieldName];
      if (typeof field !== 'object') return null;
      if (field.unique && field.primaryKey) return fieldName;
    }, null);

    if (!uniquePrimaryKey) {
      throw new Error(`model ${this.tableName} must have an unique primary key`);
    }
    this.uniquePrimaryKey = uniquePrimaryKey;
    if (caching) {
      this.cache = new Cache(this.tableName, this.schema, this.uniquePrimaryKey);
    }
  }

  /**
   * 检查数据类型是否符合字段的定义
   *
   * @param {Field} field
   * @param {string} fieldName
   * @param {(DBValue | void)} value
   * @returns
   *
   * @memberOf Model
   */
  protected isTypeMatch(field: Field, fieldName: string, value: DBValue | void) {
    let fieldType: FieldType;
    if (typeof field === 'object') {
      if (
        field.notNull &&
        (value === null || typeof value === 'undefined')
      ) {
        throw new DBInvalidTypeError({
          table: this.tableName,
          message: `field "${fieldName}" cannot be NULL`,
          field: { name: fieldName, type: field.type },
          value,
        });
      }
      fieldType = field.type;
    } else {
      fieldType = field;
    }

    if (typeof value === 'undefined') return;
    if (value === null) return;
    const errorArgs = {
      table: this.tableName,
      message: '',
      field: {
        name: fieldName,
        type: fieldType,
      },
      value,
    };
    switch (fieldType) {
    case FieldType.BLOB:
      if (!(value instanceof ArrayBuffer)) {
        errorArgs.message = `field "${fieldName}" with type BLOB must be ArrayBuffer`;
        throw new DBInvalidTypeError(errorArgs);
      }
      break;
    case FieldType.TEXT:
      if (typeof value !== 'string') {
        errorArgs.message = `field "${fieldName}" with type TEXT must be string`;
        throw new DBInvalidTypeError(errorArgs);
      }
      break;
    case FieldType.INTEGER:
      if (typeof value !== 'number' && typeof value !== 'boolean') {
        errorArgs.message = `field "${fieldName}" with type INTEGET must be number`;
        throw new DBInvalidTypeError(errorArgs);
      }
      break;
    case FieldType.REAL:
      if (typeof value !== 'number') {
        errorArgs.message = `field "${fieldName}" with type REAL must be number`;
        throw new DBInvalidTypeError(errorArgs);
      }
      break;
    case FieldType.DATETIME:
      if (!isDate(value)) {
        errorArgs.message = `field "${fieldName}" with type DATETIME must be Date`;
        throw new DBInvalidTypeError(errorArgs);
      }
      break;
    };
  }

  /**
   * 检查数据是否符合 schema 的规定，如果有字段在 schema 中未定义，则会抛出异常
   *
   * @param {stringMap} data
   *
   * @memberOf Model
   */
  checkData(data: ComplexObject): SimpleObject {
    const subKeys = this.relations.map(rel => {
      if (rel.type === RelationType.HAS_MANY) {
        return rel.asField;
      }
      return null;
    }).filter(Boolean);
    const selfData: SimpleObject = {};
    const dataKeys = Object.keys(data);
    if (!dataKeys.length) throw new Error('cannot insert an empty data');
    // 合并 shcema 上的所有字段
    dataKeys.concat(Object.keys(this.schema))
      // 去重
      .reduce((keys: string[], key) => {
        if (!keys.includes(key)) keys.push(key);
        return keys;
      }, [])
      // 逐个检验所有的 key
      .forEach(key => {
        let value = data[key] as DBValue;
        if (subKeys.includes(key)) {
          return;
        } else if (!this.schema[key] && typeof value !== 'undefined') {
          throw new DBInvalidTypeError({
            table: this.tableName,
            field: {
              name: key,
            },
            message: `"${this.tableName}" does not have a field "${key}"`,
            value,
          });
        }

        this.isTypeMatch(this.schema[key], key, value);
        if (typeof value !== 'undefined') {
          selfData[key] = value;
        }
      });
    // 检查关联 Model 的数据
    for (let [model, d] of this.eachSubModelForData(data)) {
      model.checkData(d);
    }

    return selfData;
  }

  *eachSubModelForData(data: ComplexObject | ComplexObject[]): IterableIterator<[BaseModel, ComplexObject, Relation]> {
    let dataArray: ComplexObject[];
    if (Array.isArray(data)) {
      dataArray = data;
    } else {
      dataArray = [data];
    }
    for (const _data of dataArray) {
      for (let rel of this.relations) {
        const subData = _data[rel.asField];
        if (rel.type === RelationType.HAS_MANY && Array.isArray(subData)) {
          for (let d of subData) {
            yield [rel.model, d, rel];
          };
        }
      };
    }
  }

  *eachSubModel() {
    for (let rel of this.relations) {
      if (rel.type === RelationType.HAS_MANY) {
        yield rel;
      }
    }
  }

  /**
   * 向缓存里插入数据，因为这一步是向数据库执行之后才会触发的，所以不需要做数据校验
   *
   * @param {SimpleObject} data
   *
   * @memberOf Model
   */
   protected insertIntoCache(data: SimpleObject, t?: DBTransaction) {
    if (!this.cache) return;
    const id = data[this.uniquePrimaryKey];
    if (typeof id === 'undefined') return;
    this.cache.update(id, data, t);
  }

  /**
   * 填充插入的数据，设置默认值以及自增 ID
   */
  protected fillUpValue(data: SimpleObject, statement?: Statement): SimpleObject {
    Object.keys(this.schema).forEach(key => {
      const field = this.schema[key];
      if (typeof field !== 'object') return;

      // 填充默认值
      if (
        typeof field.default !== 'undefined' &&
        typeof data[key] === 'undefined'
      ) {
        data[key] = field.default;
      }

      // 填充自增 ID
      // TODO: 自增 ID 的类型判断
      if (
        statement &&
        field.autoIncrement &&
        field.primaryKey &&
        typeof data[key] === 'undefined'
      ) {
        data[key] = statement.lastID;
      }
    });

    return data;
  }

  transformValue(data: SimpleObject): SimpleObject {
    Object.keys(data).forEach(key => {
      const field = this.schema[key];
      if (!field) {
        delete data[key];
      }
      const value = data[key];
      if (!value) return;
      if (
        field === FieldType.DATETIME ||
        (typeof field === 'object' && field.type === FieldType.DATETIME)
      ) {
        // 直接写 data[key] = new Date(value) typescript 编译器报错
        if (value instanceof Date) return;

        if (typeof value === 'string') {
          data[key] = new Date(value);
        } else if (typeof value === 'number') {
          data[key] = new Date(value);
        }
      }
    });

    return data;
  }

 /**
  * 设置数据库关联
  * 例如：
  * ```
  * scholl.hashMany(people, 'students', 'scholl_id');
  * ```
  * @param model 关联的数据库
  * @param asField 关联数据库上响应的字段
  * @param refField 自身数据库上响应的字段
  */
  hasMany(model: BaseModel, asField: string, refField: string) {
    const exists = this.relations.some(rel => {
      if (rel.model.tableName === model.tableName) return true;
      return false;
    });
    if (exists) return;
    this.relations.push({
      type: RelationType.HAS_MANY,
      model,
      asField,
      refField,
    });

    model.belongsTo(this, refField, asField);
  }
 /**
  * 设置数据库关联
  * 例如：
  * ```
  * people.belongsTo(scholl, 'scholl_id', 'students');
  * ```
  * @param model 关联的数据库
  * @param asField 关联数据库上响应的字段
  * @param refField 自身数据库上响应的字段
  */
  belongsTo(model: BaseModel, asField: string, refField: string) {
    const exists = this.relations.some(rel => {
      if (rel.model.tableName === model.tableName) return true;
      return false;
    });
    if (exists) return;
    this.relations.push({
      type: RelationType.BELONGS_TO,
      model,
      asField,
      refField,
    });
    let type = model.schema[model.uniquePrimaryKey];
    if (typeof type === 'object') {
      type = type.type;
    }
    this.schema[asField] = type;
    model.hasMany(this, refField, asField);
    if (this.cache) {
      this.cache.setIndex(asField);
    }
  }
}
