import { EventEmitter } from 'events';

import caseInsensitiveIntentMatchStrategy from './intentMatchStrategies/caseInsensitiveIntentMatchStrategy';
import EVENT_NAMES from './constants/EVENT_NAMES';
import getUtteranceFromString from './getUtteranceFromString';
import getUtterancesFromFile from './getUtterancesFromFile';
import type { Intent } from './Intent';
import type { IntentHandler } from './IntentHandler';
import type { IntentMatchStrategy } from './IntentMatchStrategy';
import type { Utterance } from './Utterance';

interface IntentManagerOptions {
  strictIntentHandlers?: boolean;
}

// What do I do for long interactions?

// TODO: Use EventEmitter to process intent
// TODO: Expose stream interface for reading from stdin. Should this be a writeable stream?
class IntentManager extends EventEmitter {
  #intentHandlers: Array<IntentHandler>;
  #matchStrategy: IntentMatchStrategy;
  #strictIntentHandlers: boolean;
  #utterances: Array<Utterance>;

  constructor(options: IntentManagerOptions = {}) {
    super();

    this.#intentHandlers = [];
    this.#strictIntentHandlers = !!options.strictIntentHandlers;
    this.#utterances = [];

    // Allow developers to select their intent matcher in the future using a Strategy
    this.#matchStrategy = caseInsensitiveIntentMatchStrategy;

    // Set up event listeners
    this.on(EVENT_NAMES.EXECUTE, (phrase) => {
      this.execute(phrase);
    });
    this.on(EVENT_NAMES.MATCH, (phrase) => {
      this.matchIntent(phrase);
    });
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

  execute(phrase: string) : (Promise<any> | any) {
    const intent = this.#matchStrategy.match(this.#utterances, phrase);

    if (!intent) {
      throw new Error(`No intent found to match phrase "${phrase}"`);
    }

    this.emit(EVENT_NAMES.WILL_HANDLE, intent);

    const intentHandler = this.#intentHandlers.find(i => i.intentName === intent.name);
    if (!intentHandler) {
      if (this.#strictIntentHandlers) {
        throw new Error(`No intent handler found for intent "${intent.name}"`);
      }

      // By default, return the name so it is easier for developers to get up and running
      return intent.name;
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
    const matchedIntent = this.#matchStrategy.match(this.#utterances, phrase);
    if (!matchedIntent) {
      this.emit(EVENT_NAMES.NOT_FOUND, { phrase });
    } else {
      this.emit(EVENT_NAMES.FOUND, matchedIntent);
    }
    return matchedIntent;
  }
}

export default IntentManager;
export type {
  IntentManager,
  IntentManagerOptions,
};
