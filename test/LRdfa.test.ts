import { LRParser, Token, Dollar } from '../src';

test('LRDFA', () => {
  const config = {
    tokens: ['c', 'd'],
    types: ['S', 'C'],
    start: 'S',
    productions: [
      {
        left: 'S',
        right: [
          {
            rule: ['C', 'C'],
            reduce(l: number, r: number) {
              return l + r;
            }
          }
        ]
      },
      {
        left: 'C',
        right: [
          {
            rule: ['c', 'C'],
            reduce(token: Token, C: number) {
              return 1 + C;
            }
          },
          {
            rule: ['d'],
            reduce() {
              return 0;
            }
          }
        ]
      }
    ]
  };
  const parser = new LRParser(config);
  expect(parser.dfa.items.length).toBe(10);
  expect(
    parser.parse([
      new Token({ type: 'c', value: 'c' }, 0, 0, 1),
      new Token({ type: 'c', value: 'c' }, 0, 1, 1),
      new Token({ type: 'c', value: 'c' }, 0, 2, 1),
      new Token({ type: 'd', value: 'd' }, 0, 3, 1),
      new Token({ type: 'c', value: 'c' }, 0, 4, 1),
      new Token({ type: 'd', value: 'd' }, 0, 5, 1)
    ])
  ).toStrictEqual({
    ok: true,
    value: 4
  });

  expect(
    parser.parse([new Token({ type: 'c', value: 'c' }, 0, 0, 1)])
  ).toStrictEqual({
    ok: false,
    token: new Token({ type: Dollar, value: Dollar }, -1, -1, -1)
  });

  expect(
    parser.parse([
      new Token({ type: 'd', value: 'd' }, 0, 0, 1),
      new Token({ type: 'd', value: 'd' }, 0, 1, 1),
      new Token({ type: 'd', value: 'd' }, 0, 2, 1)
    ])
  ).toStrictEqual({
    ok: false,
    token: new Token({ type: 'd', value: 'd' }, 0, 2, 1)
  });
});
