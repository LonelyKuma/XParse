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
