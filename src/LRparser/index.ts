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
    const stk: number[] = [0];
    const val: any[] = [undefined];
    while (true) {
      const state = stk[stk.length - 1];
      if (this.action[state].has(curCh.type)) {
        const act = this.action[state].get(curCh.type);
        if (typeof act === 'number') {
          stk.push(act);
          val.push(curCh);
          curCh = tokens.next().value;
        } else if (typeof act === 'object') {
          const args: any[] = [];
          for (let i = 0; i < act.right.length; i++) {
            stk.pop();
            args.push(val.pop());
          }
          const state = this.goto[stk[stk.length - 1]].get(act.left) as number;
          stk.push(state);
          args.reverse();
          val.push(act.reduce ? act.reduce(...args) : undefined);
          // report Production
        } else if (act === 'Accepted') {
          break;
        }
      } else {
        // report Error
        return {
          ok: false,
          token: curCh
        };
      }
    }
    return {
      ok: true,
      value: val[1]
    };
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
