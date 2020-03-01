import assert from 'assert';
import { ParserConfig, Production } from './type';
import { FirstSet } from './first';

const START = '__START__';

class Item {
  production: Production;
  pos: number;

  constructor(production: Production, pos = 0) {
    this.production = production;
    this.pos = pos;
  }
}

export class LRDFA {
  readonly tokens: Set<string>;
  readonly types: Set<string>;
  readonly productions: Production[];
  readonly firstSet: FirstSet;

  private reportError(msg: string) {
    throw new Error(`XParse Build LR automaton failed, ${msg}`);
  }

  isTerminal(name: string) {
    if (this.tokens.has(name)) {
      return true;
    } else if (this.types.has(name)) {
      return false;
    } else {
      this.reportError(`${name} is not defined`);
    }
  }

  constructor(config: ParserConfig) {
    this.tokens = new Set(config.tokens);
    this.types = new Set(config.types);
    this.types.add(START);

    assert(this.isTerminal(config.start) === false);
    this.productions = [{ left: START, right: [config.start] }];

    for (let i = 0; i < config.productions.length; i++) {
      const { left, right } = config.productions[i];
      if (left === undefined || right === undefined) {
        this.reportError(
          `Config miss left or right (${JSON.stringify(config.productions[i])})`
        );
      }
      for (const { rule, reduce } of right) {
        assert(this.isTerminal(left) === false);
        for (const symbol of rule) {
          this.isTerminal(symbol);
        }
        this.productions.push({
          left,
          right: rule,
          reduce
        });
      }
    }

    this.firstSet = new FirstSet(this.tokens, this.types, this.productions);
  }
}
