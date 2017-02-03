import {log} from 'gulp-util';

export default class Log {
  constructor() {
    this.tags = [`log`];
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

  run(context) {
    return log(context);
  }
}
