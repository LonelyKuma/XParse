import { ParserConfig, Production, Dollar } from './type';
import { LRDFA } from './LRdfa';

interface IToken {
  type: string;
  value: any;
}

export class Token {
  type: string;
  value: any;
  position: {
    row: number;
    col: number;
    length: number;
  };

  constructor(
    { type, value }: IToken,
    row: number,
    col: number,
    length: number
  ) {
    this.type = type;
    this.value = value;
    this.position = { row, col, length };
  }
}

export class LRParser {
  dfa: LRDFA;

  readonly action: Map<string, Production | number | string>[];
  readonly goto: Map<string, number>[];

  constructor(config: ParserConfig) {
    this.dfa = new LRDFA(config);
    this.action = this.dfa.Action;
    this.goto = this.dfa.Goto;
  }

  run(tokens: Generator<Token>) {
    let curCh = tokens.next().value;
    const stk = [0];
    while (true) {
      const state = stk[stk.length - 1];
      if (this.action[state].has(curCh.type)) {
        const act = this.action[state].get(curCh.type);
        if (typeof act === 'number') {
          stk.push(act);
          curCh = tokens.next().value;
        } else if (typeof act === 'object') {
          for (let i = 0; i < act.right.length; i++) {
            stk.pop();
          }
          const state = this.goto[stk[stk.length - 1]].get(act.left) as number;
          stk.push(state);
          // report Production
        } else if (act === 'Accepted') {
          break;
        }
      } else {
        // report Error
        return false;
      }
    }
    return true;
  }

  parse(tokens: Generator<Token> | Array<Token>) {
    function* gen() {
      yield* tokens;
      const EOF = new Token({ type: Dollar, value: Dollar }, -1, -1, -1);
      while (true) {
        yield EOF;
      }
    }
    return this.run(gen());
  }
}
