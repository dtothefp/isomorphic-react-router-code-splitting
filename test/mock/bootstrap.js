/* eslint require-jsdoc: 0 */

import { createStore } from 'redux';
import reducer from './reducer';

export default function() {
  const store = createStore(
    reducer,
  );

  return store;
}
