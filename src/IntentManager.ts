import { EventEmitter } from 'events';

import caseInsensitiveIntentMatchStrategy from './intentMatchStrategies/caseInsensitiveIntentMatchStrategy';
import getUtteranceFromString from './getUtteranceFromString';
import getUtterancesFromFile from './getUtterancesFromFile';
import type { Intent } from './Intent';
import type { IntentHandler } from './IntentHandler';
import type { IntentMatchStrategy } from './IntentMatchStrategy';
import type { Utterance } from './Utterance';

// What do I do for long interactions?

// TODO: Use EventEmitter to process intent
// TODO: Expose stream interface for reading from stdin. Should this be a writeable stream?
class IntentManager extends EventEmitter {
  #intentHandlers: Array<IntentHandler>;
  #matchStrategy: IntentMatchStrategy;
  #utterances: Array<Utterance>;

  constructor() {
    super();

    this.#intentHandlers = [];
    this.#utterances = [];

    // Allow developers to select their intent matcher in the future using a Strategy
    this.#matchStrategy = caseInsensitiveIntentMatchStrategy;
  }

  addIntentHandler(intentHandler: IntentHandler) : void {
    if (this.#intentHandlers.find(i => i.intentName === intentHandler.intentName)) {
      throw new Error(`An intent handler with intentName "${intentHandler.intentName}" already exists.`);
    }

    this.#intentHandlers.push(intentHandler);
  }

  addUtterance(utterance: Utterance) {
    this.#utterances.push(utterance);
  }

  execute(phrase: string) : Promise<any> {
    const intent = this.#matchStrategy.match(this.#utterances, phrase);

    if (!intent) {
      throw new Error(`No intent found to match phrase "${phrase}"`);
    }

    const intentHandler = this.#intentHandlers.find(i => i.intentName === intent.name);
    if (!intentHandler) {
      throw new Error(`No intent handler found for intent "${intent.name}"`);
    }

    return intentHandler.handler(intent);
  }

  loadUtteranceFromString(str: string) {
    const utterance = getUtteranceFromString(str);

    this.addUtterance(utterance);
  }

  async loadUtterancesFromFile(pathToUtterances: string) {
    const utterances: Array<Utterance> = await getUtterancesFromFile(pathToUtterances);

    for (let i = 0; i < utterances.length; i++) {
      this.addUtterance(utterances[i]);
    }
  }

  matchIntent(phrase: string) : (Intent | undefined) {
    return this.#matchStrategy.match(this.#utterances, phrase);
  }
}

export default IntentManager;
export type {
  IntentManager,
};
