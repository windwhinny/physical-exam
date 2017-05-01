import { createMemoryHistory } from 'history';
import reducer, { State } from './reducers/index';
import { createStore, applyMiddleware, Store, compose} from 'redux';
import { routerMiddleware } from 'react-router-redux'
import ActionPromsie from './actions/ActionPromise';

const promiseMiddleware = () => {
  // tslint:disable-next-line:no-any
  return (next: Function) => (action: any) => {
    const ap = action.promise;
    if (ap instanceof ActionPromsie) {
      if (ap.status === 'pending') {
        ap.originPromise.then(() => {
          store.dispatch(action);
        });
      }
    }
    return next(action);
  }
};

// tslint:disable-next-line:no-any
const logger = () => (next: Function) => (action: any) => {
  console.info('ACTION', action);
  return next(action);
}

export const history = createMemoryHistory()
const middleware = routerMiddleware(history)

// tslint:disable-next-line:no-any
const composeEnhancers = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(reducer,
  composeEnhancers(
    applyMiddleware(
      middleware,
      promiseMiddleware,
      logger)
  ),
) as Store<State>;

export default store;
export {
  State,
}

// tslint:disable-next-line:no-any
if ((module as any).hot) {
  // tslint:disable-next-line:no-any
  (module as any).hot.accept('./reducers/index', () =>
    store.replaceReducer(require('./reducers/index').default)
  );
}
