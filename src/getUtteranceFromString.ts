import type { Utterance } from './Utterance';

const getUtteranceFromString = (str: string): Utterance => {
  const words = str.split(' ');
  const intent = words[0];
  const phrase = words.slice(1).join(' ');

  const slots = [];
  // Populate slots ['name']. Value will be found in findUtterance
  const regex = /({\w+})/g;
  let match;
  while ((match = regex.exec(phrase)) !== null) {
    if (match.index === regex.lastIndex) {
      regex.lastIndex++;
    }

    slots.push(match[1].substring(1, match[1].length - 1)); // Remove the curly braces
  }

  return {
    intent,
    phrase,
    slots,
  }
};

export default getUtteranceFromString;
