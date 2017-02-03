import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';

const main = (state = {}, action = {}) => { // eslint-disable-line
  let newState;

  return newState || state;
};

const rootReducer = combineReducers({
  main,
  routing: routerReducer,
});

export default rootReducer;
