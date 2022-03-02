import thunk from 'redux-thunk';
import { createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';

import reducers from '../reducers';

const store = createStore(reducers, composeWithDevTools(applyMiddleware(thunk)));

export type RootStore = ReturnType<typeof store.getState>;
export default store;