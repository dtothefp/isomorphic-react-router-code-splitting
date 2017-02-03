import renderIsomorphic from '../render-isomorphic';

export default class RenderReact {
  constructor() {
    this.tags = [`render_react`];
  }

  parse(parser, nodes) {
    const tok = parser.nextToken();
    const args = parser.parseSignature(null, true);

    parser.advanceAfterBlockEnd(tok.value);

    return new nodes.CallExtension(this, `run`, args);
  }

  run(context, args) {
    const {name} = args;
    const {ctx} = context;
    const {route = `/`, store} = ctx;
    const env = ctx.env || context.env.globals.env;
    const config = ctx.config || context.env.globals.config;

    if (env === `development`) return ``;

    return renderIsomorphic({
      name,
      route,
      store,
      config,
    });
  }
}

