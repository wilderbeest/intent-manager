import { EventEmitter } from 'events';

import caseInsensitiveIntentMatchStrategy from './intentMatchStrategies/caseInsensitiveIntentMatchStrategy';
import getUtterancesFromFile from './getUtterancesFromFile';
import type { Intent } from './Intent';
import type { IntentMatchStrategy } from './IntentMatchStrategy';
import type { Utterance } from './Utterance';

// Methods:
// (eventually) addIntent(name, handler(intent))
// addUtterance(utterance)
// (eventually) execute(phrase)
// loadUtterancesByFile(pathToUtterances)
// matchIntent(phrase)

// What do I do for long interactions?

// TODO: Use EventEmitter to process intent
// TODO: Expose stream interface for reading from stdin. Should this be a writeable stream?
class IntentManager extends EventEmitter {
  #matchStrategy: IntentMatchStrategy;
  #utterances: Array<Utterance>;

  constructor() {
    super();

    this.#utterances = [];

    // Allow developers to select their intent matcher in the future using a Strategy
    this.#matchStrategy = caseInsensitiveIntentMatchStrategy;
  }

  addUtterance(utterance: Utterance) {
    this.#utterances.push(utterance);
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
  Utterance,
};
