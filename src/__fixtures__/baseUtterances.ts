export default [
  {
    intent: 'HelpIntent',
    phrase: 'help',
    slots: [],
  },
  {
    intent: 'GetInfoIntent',
    phrase: 'get {object} info',
    slots: [
      'object',
    ],
  },
  {
    intent: 'GetInfoIntent',
    phrase: 'get info for {object}',
    slots: [
      'object',
    ],
  },
];
