import Intent from '../Intent';
import IntentManager from '../IntentManager';

// As a developer, I want to store utterances in a file so I can quickly stand up simple conversational UIs.
// As a developer, I want to store utterances in a database so that my utterances are manageable as they grow.
// As a slack user, I want to message a slackbot directly for personalized responses.
// As a slack user, I want to receive slackbot responses in a channel so that context is provided to a larger conversation.
// As a user, I want to have multiple phrases to trigger a response so that I don't have to memorize specific phrases.

// Allow users to add utterances programmatically
// Allow users to add utterances by a file

const baseUtterances = [
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

describe('IntentManager', () => {
  it('should return an intent with the name and slot data', () => {
    const intentManager = new IntentManager();

    intentManager.addUtterance(baseUtterances[0]);
    intentManager.addUtterance(baseUtterances[1]);
    intentManager.addUtterance(baseUtterances[2]);

    const slotValue = 'user';
    const phrase = baseUtterances[1].phrase.replace('{object}', slotValue);

    const intent = intentManager.matchIntent(phrase);

    expect(intent).toBeInstanceOf(Intent);
    expect(intent.name).toBe(baseUtterances[1].intent);
    expect(intent.slots.object).toBe(slotValue);
    expect(intent.phrase).toBe(phrase);
    expect(intent.utterance).toBe(baseUtterances[1].phrase);
  });
});