import {
  Statement,
  SimpleObject,
  SQL,
  DBTransaction,
} from './sql';

/**
 * 所有服务的统一接口
 */
export interface Service {
  /**
   * 每个服务都需要有一个 init 方法，在一个服务的生命周期里，可能会被多次的初始化
   */
  init(): void;
  /**
   * 每个服务都需要有一个 destroy 方法，在一个服务的生命周期里，可能会被多次销毁
   */
  destroy(): void;
}

export interface ServiceRegistorInterface {
  /* tslint:disable-next-line:no-any no-unsafe-any */
  get(serviceName: string): any;
}

export interface DBInterface {
  /* tslint:disable-next-line:no-any no-unsafe-any */
  transaction(runner: (t: DBTransaction) => Promise<any>[]): Promise<any[]>;
  run(sql: SQL, t?: DBTransaction): Promise<Statement>;
  all(sql: SQL, t?: DBTransaction): Promise<SimpleObject[]>;
  close(): Promise<void>;
}
