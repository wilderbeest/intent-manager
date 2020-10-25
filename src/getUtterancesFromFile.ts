import fs from 'fs';

import type { Utterance } from './Utterance';

export default async (pathToUtterances: string) : Promise<Array<Utterance>> => {
  const content: string = await new Promise((resolve, reject) => {
    fs.readFile(pathToUtterances, 'utf8', (err, data) => {
      if (err) {
        reject(err)
      } else {
        resolve(data);
      }
    });
  });

  const utterances: Array<Utterance> = content
    .split('\n')
    .map((line: string) => {
      const words = line.split(' ');
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
    })
    .filter(utterance => utterance.intent !== '' && utterance.phrase !== '');

  return utterances;
}