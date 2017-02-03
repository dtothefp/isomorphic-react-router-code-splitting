import {log} from 'gulp-util';

export default class Debug {
  constructor() {
    this.tags = [`debug`];
  }

  parse(parser, nodes) {
    const tok = parser.nextToken();
    const args = parser.parseSignature(null, true);

    parser.advanceAfterBlockEnd(tok.value);

    return new nodes.CallExtension(this, `run`, args);
  }

  run(context, args) {
    log(`***START***`);
    log(args);
    log(`***END***`);
  }
}
