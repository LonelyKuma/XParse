import { LRParser, Token } from '../src/LRparser';

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
            rule: ['C', 'C']
          }
        ]
      },
      {
        left: 'C',
        right: [
          {
            rule: ['c', 'C']
          },
          {
            rule: ['d']
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
  ).toBeTruthy();

  expect(
    parser.parse([new Token({ type: 'c', value: 'c' }, 0, 0, 1)])
  ).toBeFalsy();

  expect(
    parser.parse([
      new Token({ type: 'd', value: 'd' }, 0, 0, 1),
      new Token({ type: 'd', value: 'd' }, 0, 1, 1),
      new Token({ type: 'd', value: 'd' }, 0, 2, 1)
    ])
  ).toBeFalsy();
});
