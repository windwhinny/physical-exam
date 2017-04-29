import { createMemoryHistory } from 'history';
import reducer, { State } from './reducers/index';
import { createStore, applyMiddleware, Store} from 'redux';
import { routerMiddleware } from 'react-router-redux'

export const history = createMemoryHistory()
const middleware = routerMiddleware(history)

const store = createStore(reducer, applyMiddleware(middleware)) as Store<State>;

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
