import Intent from '../Intent';
import type { IntentMatchStrategy } from '../IntentMatchStrategy';

// TODO: Simplify this into splits that don't use regex. Just loop over the slots.
const getUtteranceParts = (phrase: string, slots: Array<any>): Array<any> => {
  // Build up regex string based on slots to find words NOT part of slot
  const nonSlot = '([\\w ]*)';
  let regexStr = `${nonSlot}${slots.map((slotName) => `({${slotName}})${nonSlot}`).join('')}`;
  const regex = new RegExp(regexStr, 'g');

  let phraseParts: Array<string> = [];
  let srcMatch;
  while ((srcMatch = regex.exec(phrase)) !== null) {
    if (srcMatch.index === regex.lastIndex) {
      regex.lastIndex++;
    }
    phraseParts = srcMatch.slice(1); // Remove the curly braces
  }

  return phraseParts
    // Remove empty strings
    .filter(word => !!word);
};

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
      const slotEndIndex = utteranceParts[i + 2] ? remainingPhrase.indexOf(utteranceParts[i + 2]) : remainingPhrase.length;
      slots.push(remainingPhrase.substring(slotStartIndex, slotEndIndex));

      remainingPhrase = remainingPhrase.substring(slotEndIndex);
    } else if (utteranceParts[i][0] === '{') {
      // The rest of the phrase is a slot
      slots.push(remainingPhrase);
      remainingPhrase = '';
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
};

const caseInsensitiveMatchStrategy: IntentMatchStrategy = {
  name: 'caseInsensitive',
  match: (utterances, phrase) => {
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
  },
};

export default caseInsensitiveMatchStrategy;
