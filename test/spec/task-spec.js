import {expect} from 'chai';
import sinon from 'sinon';
import task from '../../lib/util/task';

describe(`#task`, () => {
  const spy = sinon.spy();
  const task1 = task(`task`, (...args) => {
    spy(...args);
    return Promise.resolve();
  });

  afterEach(() => {
    spy.reset();
  });

  it(`run the individual task`, async () => {
    const runner = task(`main`, async () => {
      await task1();
    });

    await runner();

    expect(spy.called).to.be.true;
  });

  it(`should pass arguments into the task`, async () => {
    const args = {bleep: `bloop`};
    const runner = task(`main`, async () => {
      await task1(args);
    });

    await runner();

    const [called] = spy.getCall(0).args;

    expect(called).to.eq(args);
  });

  it(`should run a sequence of tasks`, async () => {
    const spy2 = sinon.spy();
    const task2 = task(`task`, (...args) => {
      spy2(...args);
      return Promise.resolve();
    });

    const runner = task(`main`, async () => {
      await task1();
      await task2();
    });

    await runner();

    sinon.assert.callOrder(spy, spy2);
  });
});
