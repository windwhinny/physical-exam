
export default class ActionPromsie <T> {
  result: T;
  // tslint:disable-next-line:no-any
  error: any;
  status: 'pending' | 'resolved' | 'rejected' = 'pending';
  originPromise: Promise<void>;

  constructor(promise: Promise<T>) {
    this.originPromise = promise.then((result: T) => {
      this.status = 'resolved';
      this.result = result;
    }, err => {
      this.status = 'rejected';
      this.error = err;
    });
  }
}
