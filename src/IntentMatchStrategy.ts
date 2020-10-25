import type { Intent } from './Intent';
import type { Utterance } from './Utterance';

interface IntentMatchStrategy {
  name: string;
  match(utterances: Array<Utterance>, phrase: string): (Intent | undefined);
}

export type {
  IntentMatchStrategy,
};
