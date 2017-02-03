import { put, takeLatest } from 'redux-saga/effects';

/**
 * Fetchers
 * @param {string} action - Passes params.id
 */
export const main = function* () {
  try {
    const data = yield Promise.resolve({done: true});

    yield put({type: `RESOLVED`, data});
  }
  catch (e) {
    yield put({type: `ERROR`});
  }
};

/**
 * Sagas to be launched at app startup.
 */
const rootSaga = function* () {
  yield [
    takeLatest(`INIT`, main),
  ];
};

export default rootSaga;
