import assert from 'assert';

import { Production, Epsilon } from './type';

export class FirstSet {
  readonly tokens: Set<string>;
  readonly types: Set<string>;

  readonly first: Map<string, string[]> = new Map();
  readonly isEpsilon: Set<string> = new Set();

  private addFirst(x: string, y: string): number {
    assert(!this.isTerminal(x));
    assert(this.isTerminal(y));
    if (!this.first.has(x)) {
      this.first.set(x, [y]);
      return 1;
    } else {
      const arr = this.first.get(x) as string[];
      if (arr.includes(y)) {
        return 0;
      } else {
        arr.push(y);
        return 0;
      }
    }
  }

  private reportError(msg: string) {
    throw new Error(`XParse Build LR automaton failed, ${msg}`);
  }

  isTerminal(name: string) {
    if (this.tokens.has(name) || name === Epsilon) {
      return true;
    } else if (this.types.has(name)) {
      return false;
    } else {
      this.reportError(`${name} is not defined`);
    }
  }

  query(...args: string[]): string[] {
    if (args.length === 0 || (args.length === 1 && args[0] === Epsilon)) {
      return [Epsilon];
    }
    const res = new Set<string>();
    let isBreak = false;
    for (const item of args) {
      if (this.isTerminal(item)) {
        res.add(item);
        isBreak = true;
        break;
      } else {
        (this.first.get(item) || []).forEach(symbol => {
          if (symbol !== Epsilon) res.add(symbol);
        });
        if (!this.isEpsilon.has(item)) {
          isBreak = true;
          break;
        }
      }
    }
    if (!isBreak) res.add(Epsilon);
    const ans = [...res];
    ans.sort();
    return ans;
  }

  constructor(
    tokens: Set<string>,
    types: Set<string>,
    productions: Production[]
  ) {
    this.tokens = tokens;
    this.types = types;

    tokens.forEach(token => this.first.set(token, [token]));

    while (true) {
      let haveNew = 0;
      for (const { left, right } of productions) {
        let isBreak = false;
        if (right.length === 0 || (right.length === 1 && right[0] === '')) {
          this.isEpsilon.add(left);
        } else {
          for (const item of right) {
            if (this.isTerminal(item)) {
              haveNew += this.addFirst(left, item);
              isBreak = true;
              break;
            } else {
              (this.first.get(item) || []).forEach(
                symbol => (haveNew += this.addFirst(left, symbol))
              );
              if (!this.isEpsilon.has(item)) {
                isBreak = true;
                break;
              }
            }
          }
        }
        if (!isBreak) {
          this.isEpsilon.add(left);
        }
      }
      if (!haveNew) break;
    }

    this.isEpsilon.forEach(symbol => this.addFirst(symbol, Epsilon));
  }
}
