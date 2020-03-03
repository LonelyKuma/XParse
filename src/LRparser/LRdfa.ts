import assert from 'assert';
import { ParserConfig, Production, START, Epsilon, Dollar } from './type';
import { FirstSet } from './first';
import { DiffSet } from './diffSet';

function groupBy(productions: Production[]) {
  const map = new Map<string, Production[]>();
  productions.forEach(({ left }) => map.set(left, []));
  productions.forEach(prod => (map.get(prod.left) as Production[]).push(prod));
  return map;
}

class Item {
  readonly production: Production;
  readonly pos: number;
  readonly lookup: string;

  constructor(production: Production, pos = 0, lookup = Epsilon) {
    this.production = production;
    this.pos = pos;
    this.lookup = lookup;
  }

  equal(y: Item) {
    return (
      this.production === y.production &&
      this.pos === y.pos &&
      this.lookup === y.lookup
    );
  }

  print() {
    const str = [
      ...(this.pos > 0 ? this.production.right.slice(0, this.pos) : []),
      '.',
      ...this.production.right.slice(this.pos)
    ].join(' ');
    return this.production.left + ' -> ' + str + ' , ' + this.lookup;
  }
}

export class LRDFA {
  readonly tokens: Set<string>;
  readonly types: Set<string>;
  readonly productions: Production[];
  readonly items: Item[][];

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
    this.tokens = new Set([...config.tokens, Dollar]);
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

    const firstSet = new FirstSet(this.tokens, this.types, this.productions);
    const group = groupBy(this.productions);

    // Cache all Item Object
    // Do not construct extra Object!
    const itemCache: Item[] = [];
    const getItem = (x: Item) => {
      for (const y of itemCache) {
        if (x.equal(y)) {
          return y;
        }
      }
      return itemCache.push(x), x;
    };

    const closure = (I: Item[]) => {
      const ans = new Set<Item>(I);
      while (true) {
        let haveNew = 0;
        const add = (x: Item) => {
          if (ans.has(x)) return;
          ans.add(x);
          haveNew++;
        };
        for (const item of ans) {
          if (item.pos >= item.production.right.length) {
            continue;
          }
          const B = item.production.right[item.pos];
          const firstBeta = firstSet.query(
            ...item.production.right.slice(item.pos + 1).concat(item.lookup)
          );
          for (const prod of group.get(B) || []) {
            for (const b of firstBeta) {
              add(getItem(new Item(prod, 0, b)));
            }
          }
        }
        if (haveNew === 0) break;
      }
      return [...ans];
    };
    const move = (I: Item[], w: string) => {
      const ans: Item[] = [];
      for (const item of I) {
        if (
          item.pos < item.production.right.length &&
          item.production.right[item.pos] === w
        ) {
          ans.push(
            getItem(new Item(item.production, item.pos + 1, item.lookup))
          );
        }
      }
      return closure(ans);
    };

    const allT = new Set([...this.tokens, ...this.types]);
    allT.delete(Dollar);

    const st = getItem(new Item(this.productions[0], 0, Dollar));
    const C = [closure([st])];
    const hsh = new DiffSet<Item>();
    const hshSet = new Set<number>([hsh.getSet(C[0])]);

    while (true) {
      let haveNew = 0;
      for (const item of C) {
        for (const ch of allT) {
          const v = move(item, ch);
          if (v.length === 0) continue;
          const val = hsh.getSet(v);
          if (!hshSet.has(val)) {
            hshSet.add(val);
            C.push(v);
          }
        }
      }
      if (haveNew === 0) break;
    }

    this.items = C;

    // let i = 0;
    // const print = (obj: Item[]) => {
    //   console.log(i++ + ': ');
    //   for (const x of obj) {
    //     console.log(x.print());
    //   }
    //   console.log();
    // };
    // C.forEach(x => print(x))
  }
}
