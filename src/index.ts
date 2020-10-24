import { EventEmitter } from 'events';

import Intent from './Intent';

const getUtteranceParts = (phrase: string, slots: Array<any>): Array<any> => {
  // Build up regex string based on slots to find words NOT part of slot
  const nonSlot = '([\\w ]*)';
  let regexStr = `${nonSlot}${slots.map((slotName) => `({${slotName}})${nonSlot}`).join('')}`;
  const regex = new RegExp(regexStr, 'g');

  let phraseParts: Array<any> = [];
  let srcMatch;
  while ((srcMatch = regex.exec(phrase)) !== null) {
    if (srcMatch.index === regex.lastIndex) {
      regex.lastIndex++;
    }
    phraseParts = srcMatch.slice(1); // Remove the curly braces
  }

  return phraseParts;
}

const getSlotValues = (utteranceParts: Array<any>, phrase: string) => {
  // Use sections not part of slot to build regexStr identifying what values fill slots
  let slots = [];

  let i = 0;
  let remainingPhrase = phrase;
  while (i < utteranceParts.length) {
    if (remainingPhrase.indexOf(utteranceParts[i]) < 0) {
      slots = [];
      break;
    }

    // i is the index between slots, so make sure a further slot exists
    if (utteranceParts[i + 1]) {
      const slotStartIndex = utteranceParts[i].length;
      const slotEndIndex = remainingPhrase.indexOf(utteranceParts[i + 2]);
      slots.push(remainingPhrase.substring(slotStartIndex, slotEndIndex));

      remainingPhrase = remainingPhrase.substring(slotEndIndex);
    } else if (remainingPhrase.length !== utteranceParts[i].length) {
      slots = [];
      break;
    }

    i += 2;
  }

  return slots;
};

const findUtteranceMatch = (utterances: Array<any>, phrase: string): any => {
  const utteranceMatch = utterances.reduce((acc, utterance) => {
    // If match already found, stop looking
    if (acc) return acc;

    if (utterance.slots.length === 0) {
      if (utterance.phrase.toLowerCase() === phrase.toLowerCase()) {
        return utterance;
      } else {
        return null;
      }
    }

    const utteranceParts = getUtteranceParts(utterance.phrase, utterance.slots);

    const slotValues = getSlotValues(utteranceParts, phrase);

    if (slotValues.length === utterance.slots.length) {
      return {
        ...utterance,
        slotValues,
      };
    } else {
      return null;
    }
  }, null);

  return utteranceMatch;
}

const findIntent = (utterances: Array<any>, phrase: string) => {
  const match = findUtteranceMatch(utterances, phrase);

  // Should this be Intent instead of Utterance?
  if (match) {
    const slotPairs = match.slots
      .map((slotName: string, idx: number) => ({ name: slotName, value: match.slotValues[idx] }))
      .reduce((slots: any, slot: any) => {
        slots[slot.name] = slot.value;
        return slots;
      }, {});

    return new Intent({
      utterance: match.phrase,
      phrase, // What the user sends
      name: match.intent,
      slots: slotPairs,
      slotValues: match.slotValues,
    });
  }
};

// Methods:
// addIntent(intent)
// matchIntent(phrase)
// addUtterance(utterance)
// loadUtterances(utterances)
// loadUtterancesByFile(pathToUtterances)

// What do I do for long interactions?

// TODO: Use EventEmitter to process intent
// TODO: Expose stream interface for reading from stdin. Should this be a writeable stream?
class IntentManager extends EventEmitter {
  #intents: any;
  #utterances: Array<any>;

  constructor() {
    super();

    this.#intents = {};
    this.#utterances = [];
  }

  addIntentHandler(name: string, handler: any) {
    if (this.#intents[name]) {
      throw new Error(`Intent "${name}" already has a handler`);
    }

    this.#intents[name] = handler;
  }

  addUtterance(utterance: any) {
    this.#utterances.push(utterance);
  }

  matchIntent(phrase: string) {
    const intent = findIntent(this.#utterances, phrase);

    if (!intent) {
      throw new Error(`Unable to find intent for phrase`);
    }

    if (!this.#intents[intent.name]) {
      throw new Error(`Intent "${intent.name}" is not registered`);
    }

    // What if the request was made as part of an existing interaction?
    // Should we merge that data with the context?
    const handlerContext = {
      name: intent.name,
      slots: intent.slots,
      slotValues: intent.slotValues,
    };

    return {
      name: intent.name,
      handle: () => this.#intents[intent.name](handlerContext),
    };
  }
}

export {
  IntentManager,
};
