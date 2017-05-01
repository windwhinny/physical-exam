import ActionPromise from '../actions/ActionPromise';

export default function<
  S extends {
    pending: boolean,
    error: Error | null,
  },
  N extends keyof S,
  A extends {
    promise: ActionPromise<S[N]>,
  }
>(state: S, name: N, action: A, update: (r: S[N]) => S[N]): S {
  switch (action.promise.status) {
    case 'pending':
      return Object.assign({}, state, {
        error: null,
        pending: true,
      });
    case 'resolved':
      return Object.assign({}, state, {
        [name as string]: update(action.promise.result),
        error: null,
        pending: false,
      });
    case 'rejected':
      return Object.assign({}, state, {
        error: action.promise.error,
        pending: false,
      });
  }
  return state;
}
