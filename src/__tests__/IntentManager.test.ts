import path from 'path';

import Intent from '../Intent';
import IntentManager from '../IntentManager';

import baseUtterances from '../__fixtures__/baseUtterances';

// As a developer, I want to store utterances in a file so I can quickly stand up simple conversational UIs.
// As a developer, I want to store utterances in a database so that my utterances are manageable as they grow.
// As a developer, I want to stream stdin so I can write conversational CLIs.
// As a slack user, I want to message a slackbot directly for personalized responses.
// As a slack user, I want to receive slackbot responses in a channel so that context is provided to a larger conversation.
// As a user, I want to have multiple phrases to trigger a response so that I don't have to memorize specific phrases.

// Allow users to add utterances programmatically
// Allow users to add utterances by a file

describe('IntentManager', () => {
  it('should return an intent with no slots', () => {
    const intentManager = new IntentManager();

    intentManager.addUtterance(baseUtterances[0]);
    intentManager.addUtterance(baseUtterances[1]);
    intentManager.addUtterance(baseUtterances[2]);

    const phrase = baseUtterances[0].phrase;

    const intent = intentManager.matchIntent(phrase);

    expect(intent).toBeDefined();
    expect(intent).toBeInstanceOf(Intent);
    expect(intent.name).toBe(baseUtterances[0].intent);
    expect(intent.slots).toStrictEqual({});
    expect(intent.phrase).toBe(phrase);
    expect(intent.utterance).toBe(baseUtterances[0].phrase);
  });

  it('should return an intent with the name and slot data', () => {
    const intentManager = new IntentManager();

    intentManager.addUtterance(baseUtterances[0]);
    intentManager.addUtterance(baseUtterances[1]);
    intentManager.addUtterance(baseUtterances[2]);
    intentManager.addUtterance(baseUtterances[3]);

    const propertyValue = 'location';
    const objectValue = 'user';
    const phrase = baseUtterances[3].phrase.replace('{property}', propertyValue).replace('{object}', objectValue);

    const intent = intentManager.matchIntent(phrase);

    expect(intent).toBeDefined();
    expect(intent).toBeInstanceOf(Intent);
    expect(intent.name).toBe(baseUtterances[3].intent);
    expect(intent.slots.property).toBe(propertyValue);
    expect(intent.slots.object).toBe(objectValue);
    expect(intent.phrase).toBe(phrase);
    expect(intent.utterance).toBe(baseUtterances[3].phrase);
  });

  it('should allow loading of utterances from a file', async () => {
    const intentManager = new IntentManager();

    await intentManager.loadUtterancesFromFile(path.join(__dirname, '../__fixtures__/sampleUtterances.txt'));

    const phrase = 'get user info';
    const intent = intentManager.matchIntent(phrase);

    expect(intent).toBeInstanceOf(Intent);
    expect(intent.name).toBe('GetInfoIntent');
  });

  it('can execute intent handlers which match a phrase', () => {
    const intentManager = new IntentManager();

    const handler = jest.fn();

    intentManager.loadUtteranceFromString('GetInfo get {object} info');
    intentManager.addIntentHandler({
      intentName: 'GetInfo',
      handler,
    });
    intentManager.execute('get user info');
    
    expect(handler).toBeCalledTimes(1);
    expect(handler.mock.calls[0][0].slots.object).toBe('user');
  });

  it('can execute async intent handlers which match a phrase', async () => {
    const intentManager = new IntentManager();

    const handler = async (intent: Intent) => {
      return intent.slots.object;
    };

    intentManager.loadUtteranceFromString('GetInfo get {object} info');
    intentManager.addIntentHandler({
      intentName: 'GetInfo',
      handler,
    });
    const result = await intentManager.execute('get user info');

    expect(result).toBe('user');
  });

  // it('emits the "intent:found" event when receiving a "match" event, passing extra data back', () => {

  // });

  // it('emits the "intent:notfound" event when receiving a "match" event where no utterances matches', () => {

  // });

  // it('emits the "intent:willHandle" event before executing the intent handler for the phrase passed to an "execute" event', () => {

  // });

  // it('calls the intent handler for a matched intent of a phrase passed to the "data" event', () => {

  // });

  // it('writes intent handler result (to stdout?) when the "data" event receives a phrase matching an utterance', () => {

  // });

  // it('writes error (to stderr?) when the "data" event receives a phrase matching no utterance', () => {

  // });

  // it('writes error (to stderr?) when an error occurs while streaming the matched intent handler', () => {

  // });
});
