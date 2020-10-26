import type { Intent } from './Intent';

interface IntentHandler {
  intentName: string;
  handler(intent: Intent) : any;
}

export type {
  IntentHandler,
};
