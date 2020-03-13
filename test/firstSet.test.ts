import { FirstSet } from '../src/LRparser/first';
import { Epsilon } from '../src/LRparser/type';

test('FirstSet', () => {
  const first = new FirstSet(
    new Set(['a', 'b', 'c']),
    new Set(['S', 'A', 'B', 'C', 'D']),
    [
      { left: 'S', right: ['A', 'B'] },
      { left: 'S', right: ['b', 'C'] },
      { left: 'A', right: [''] },
      { left: 'A', right: ['b'] },
      { left: 'B', right: [] },
      { left: 'B', right: ['a', 'D'] },
      { left: 'C', right: ['A', 'D'] },
      { left: 'C', right: ['b'] },
      { left: 'D', right: ['a', 'S'] },
      { left: 'D', right: ['c'] }
    ]
  );

  expect(first.query('S')).toStrictEqual([Epsilon, 'a', 'b']);
  expect(first.query('A')).toStrictEqual([Epsilon, 'b']);
  expect(first.query('B')).toStrictEqual([Epsilon, 'a']);
  expect(first.query('C')).toStrictEqual(['a', 'b', 'c']);
  expect(first.query('D')).toStrictEqual(['a', 'c']);

  expect(first.query('A', 'B')).toStrictEqual([Epsilon, 'a', 'b']);
  expect(first.query('b', 'C')).toStrictEqual(['b']);
  expect(first.query(Epsilon)).toStrictEqual([Epsilon]);
  expect(first.query('b')).toStrictEqual(['b']);
  expect(first.query('a', 'D')).toStrictEqual(['a']);
  expect(first.query('A', 'D')).toStrictEqual(['a', 'b', 'c']);
  expect(first.query('a', 'S')).toStrictEqual(['a']);
  expect(first.query('c')).toStrictEqual(['c']);
});

test('FirstSet2', () => {
  const first = new FirstSet(
    new Set([
      'LBrace',
      'RBrace',
      'Semicolon',
      'Number',
      'Plus',
      'Mul',
      'LRound',
      'RRound',
      '$'
    ]),
    new Set(['StatmentList', 'Statement', 'Expression', 'Term', 'Factor']),
    [
      {
        left: 'StatmentList',
        right: ['Statement', 'StatmentList']
      },
      { left: 'StatmentList', right: [] },
      {
        left: 'Statement',
        right: ['LBrace', 'StatmentList', 'RBrace']
      },
      {
        left: 'Statement',
        right: ['Expression', 'Semicolon']
      },
      {
        left: 'Expression',
        right: ['Term', 'Plus', 'Expression']
      },
      { left: 'Expression', right: ['Term'] },
      {
        left: 'Term',
        right: ['Factor', 'Mul', 'Term']
      },
      { left: 'Term', right: ['Factor'] },
      { left: 'Factor', right: ['Number'] },
      {
        left: 'Factor',
        right: ['LRound', 'Expression', 'RRound']
      }
    ]
  );

  expect(first.query('Expression')).toStrictEqual(['LRound', 'Number']);
  expect(first.query('Statement')).toStrictEqual([
    'LBrace',
    'LRound',
    'Number'
  ]);
  expect(first.query('StatmentList', '$')).toStrictEqual([
    '$',
    'LBrace',
    'LRound',
    'Number'
  ]);
});
