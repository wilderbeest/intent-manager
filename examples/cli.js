import { IntentManager } from '../dist/index.js';

const intentManager = new IntentManager();

intentManager.loadUtteranceFromString('GetInfo get {object} info');
intentManager.loadUtteranceFromString('SendInfo send {object} info');
intentManager.addIntentHandler({
  intentName: 'GetInfo',
  handler: (intent) => {
    console.log('Found intent', intent.name, intent.slots.object);
  },
});
intentManager.addIntentHandler({
  intentName: 'SendInfo',
  handler: intent => `Found intent ${intent.name} ${intent.slots.object}\n`,
});

process.stdin.pipe(intentManager).pipe(process.stdout);
