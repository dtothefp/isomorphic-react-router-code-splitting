import nunjucks from 'nunjucks';

export default class ReduxStore {
  constructor() {
    this.tags = [`redux_store`];
  }

  parse(parser, nodes) {
    const tok = parser.nextToken();
    const args = parser.parseSignature(null, true);
    // You must include this if there are no args to prevent errors
    if (args.children.length === 0) {
      args.addChild(new nodes.Literal(0, 0, ``));
    }

    parser.advanceAfterBlockEnd(tok.value);

    return new nodes.CallExtension(this, `run`, args);
  }

  run(context, args) {
    const {ctx} = context;
    const store = args.store || ctx.store.getState();

    return new nunjucks.runtime.SafeString(
      `<script>window.__STORE__ = ${JSON.stringify(store)}</script>`
    );
  }
}
