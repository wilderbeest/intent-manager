import fs from 'fs';

import getUtteranceFromString from './getUtteranceFromString';
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
    .map(getUtteranceFromString)
    .filter(utterance => utterance.intent !== '' && utterance.phrase !== '');

  return utterances;
}