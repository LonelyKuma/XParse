export default {
  debug: true,
  hooks: {},
  tokens: [
    'Number',
    'Float',
    'Plus',
    'Minus',
    'Mul',
    'Div',
    'LRound',
    'RRound',
  ],
  types: ['calculator', 'term', 'factor'],
  start: 'calculator',
  productions: [
    {
      left: 'calculator',
      right: [
        {
          rule: ['term', 'Plus', 'calculator'],
          reduce(l, m, r) {
            return l + r;
          },
        },
        {
          rule: ['term', 'Minus', 'calculator'],
          reduce(l, m, r) {
            return l - r;
          },
        },
        {
          rule: ['term'],
          reduce(value) {
            return value;
          },
        },
      ],
    },
    {
      left: 'term',
      right: [
        {
          rule: ['factor', 'Mul', 'term'],
          reduce(l, m, r) {
            return l * r;
          },
        },
        {
          rule: ['factor', 'Div', 'term'],
          reduce(l, m, r) {
            return l / r;
          },
        },
        {
          rule: ['factor'],
          reduce(value) {
            return value;
          },
        },
      ],
    },
    {
      left: 'factor',
      right: [
        {
          rule: ['Plus', 'Number'],
          reduce(m, { value }) {
            return value;
          },
        },
        {
          rule: ['Minus', 'Number'],
          reduce(m, { value }) {
            return -value;
          },
        },
        {
          rule: ['Number'],
          reduce({ value }) {
            return value;
          },
        },
        {
          rule: ['Float'],
          reduce({ value }) {
            return value;
          },
        },
        {
          rule: ['LRound', 'calculator', 'RRound'],
          reduce(l, value) {
            return value;
          },
        },
      ],
    },
  ],
};
