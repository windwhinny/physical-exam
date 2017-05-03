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
>(
  state: S,
  name: N,
  action: A,
  updater: (r: S[N]) => S[N],
  onResolved?: (s: S) => S,
  onRejected?: (s: S) => S,
): S {
  let newState: S;
  switch (action.promise.status) {
    case 'pending':
      return Object.assign({}, state, {
        error: null,
        pending: true,
      });
    case 'resolved':
      newState = Object.assign({}, state, {
        [name as string]: updater(action.promise.result),
        error: null,
        pending: false,
      });
      if (onResolved) {
        return onResolved(newState);
      }
      return newState;
    case 'rejected':
      newState = Object.assign({}, state, {
        error: action.promise.error,
        pending: false,
      });
      if (onRejected) {
        return onRejected(newState);
      }
      return newState;
  }
  return state;
}
