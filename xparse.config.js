module.exports = {
  hooks: {},
  tokens: [
    'Number',
    'Float',
    'Plus',
    'Minus',
    'Mul',
    'Div',
    'LBracket',
    'RBracket'
  ],
  types: [
    'calculator',
    'term',
    'factor'
  ],
  start: 'calculator',
  productions: [
    {
      left: 'calculator',
      right: [
        {
          rule: [
            'term', 'Plus', 'term'
          ]
        },
        {
          rule: [
            'term', 'Minus', 'term'
          ]
        },
        {
          rule: [
            'term'
          ]
        }
      ]
    },
    {
      left: 'term',
      right: [
        {
          rule: [
            'factor', 'Mul', 'factor'
          ]
        },
        {
          rule: [
            'factor', 'Div', 'factor'
          ]
        },
        {
          rule: [
            'factor'
          ]
        }
      ]
    },
    {
      left: 'factor',
      right: [
        {
          rule: [
            'Number'
          ]
        },
        {
          rule: [
            'Float'
          ]
        },
        {
          rule: [
            'LBracket', 'calculator', 'RBracket'
          ]
        }
      ]
    }
  ]
};