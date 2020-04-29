import assert from 'assert';
import { ParserConfig, Production, START, Epsilon, Dollar } from './type';
import { FirstSet } from './first';
import { SetMap } from '@yjl9903/setmap';

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
  readonly Action: Map<string, Production | number | 'Accepted'>[];
  readonly Goto: Map<string, number>[];

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
    this.productions = [
      { left: START, right: [config.start], reduce: value => value }
    ];

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

    const closureCache = new SetMap<Item, Item[]>();
    const closure = (I: Item[]) => {
      if (closureCache.has(I)) {
        return closureCache.get(I);
      }
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
      const r = [...ans];
      closureCache.set(I, r);
      return r;
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
    const setMap = new SetMap<Item, number>([C[0], 0]);

    while (true) {
      let haveNew = 0;
      for (const item of C) {
        for (const ch of allT) {
          const v = move(item, ch);
          if (v.length === 0) continue;
          if (setMap.add(v, C.length)) {
            C.push(v);
            haveNew++;
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

    const Action = C.map(
      () => new Map<string, Production | number | 'Accepted'>()
    );
    const Goto = C.map(() => new Map<string, number>());
    for (let i = 0; i < C.length; i++) {
      const I = C[i];
      for (const item of I) {
        assert(this.isTerminal(item.lookup));
        if (item.pos === item.production.right.length) {
          const act: 'Accepted' | Production =
            item.production === this.productions[0] &&
            item.pos === 1 &&
            item.lookup === Dollar
              ? 'Accepted'
              : item.production;
          if (
            Action[i].has(item.lookup) &&
            Action[i].get(item.lookup) !== act
          ) {
            if (typeof Action[i].get(item.lookup) === 'number') {
              this.reportError('shift-reduce conflict');
            } else {
              this.reportError('reduce-reduce conflict');
            }
          }
          Action[i].set(item.lookup, act);
        } else {
          const ch = item.production.right[item.pos];
          const v = move(I, ch);
          if (v.length > 0) {
            const j = setMap.get(v);
            if (this.isTerminal(ch)) {
              if (Action[i].has(ch) && Action[i].get(ch) !== j) {
                this.reportError('shift-reduce conflict');
              }
              Action[i].set(ch, j);
            } else {
              if (Goto[i].has(ch) && Goto[i].get(ch) !== j) {
                this.reportError('construct Goto failed');
              }
              Goto[i].set(ch, j);
            }
          }
        }
      }
    }
    this.Action = Action;
    this.Goto = Goto;
  }
}
