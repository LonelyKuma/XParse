import { LRDFA } from '../src/LRparser/LRdfa';

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
  const dfa = new LRDFA(config);
  expect(dfa.items.length).toBe(10);
});
