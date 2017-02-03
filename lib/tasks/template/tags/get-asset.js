import {readJsonSync} from 'fs-extra';
import nunjucks from 'nunjucks';

export default class GetAssets {
  constructor() {
    this.tags = [`get_asset`];
  }

  parse(parser, nodes) {
    const tok = parser.nextToken();
    const args = parser.parseSignature(null, true);

    parser.advanceAfterBlockEnd(tok.value);

    return new nodes.CallExtension(this, `run`, args);
  }

  makeLink({stats}) {
    return `<link rel="stylesheet" href="${stats.styles.main}">`;
  }

  makeScript(fp) {
    return `<script src="${fp}" type="text/javascript"></script>`;
  }

  run(context, args) {
    const {type} = args;
    const {ctx} = context;
    const config = ctx.config || context.env.globals.config;
    const {cwd, statsFile, dest} = config;
    const statsFp = cwd(dest, statsFile);
    const stats = readJsonSync(statsFp);
    let tag;

    switch (type) {
      case `css`:
        tag = this.makeLink({stats});
        break;
      case `js`:
        tag = this.makeScript(stats.javascript.main);
        break;
    }

    return new nunjucks.runtime.SafeString(tag);
  }
}
