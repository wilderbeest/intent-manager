# @djragsdale/intent-manager

## Usage

The intent manager package should be able to be used as either a CommonJS module or EcmaScript module.

```javascript
import { IntentManager } from '@djragsdale/intent-manager';
```

```javascript
const { IntentManager } = require('@djragsdale/intent-manager');
```

### Adding Utterances From File

```javascript
import { IntentManager } from '@djragsdale/intent-manager';
import path from 'path';

(async () => {
  const intentManager = new IntentManager();

  await intentManager.loadUtterancesFromFile(path.join(__dirname, '../__fixtures__/sampleUtterances.txt'));
})();
```

### Adding Utterances From Strings

```javascript
import { IntentManager } from '@djragsdale/intent-manager';

const intentManager = new IntentManager();

intentManager.loadUtteranceFromString('GetInfo get {object} info');

export default intentManager;
```

### Using Intent Handlers

```javascript
import { IntentManager } from '@djragsdale/intent-manager';

const intentManager = new IntentManager();

intentManager.loadUtteranceFromString('GetInfo get {object} info');
intentManager.addIntentHandler({
  intentName: 'GetInfo',
  handler: async (intent) => {
    await doAsyncThings(intent);
  },
});

intentManager.execute('get user info');
```

### Handling Intent Matches Manually

```javascript
import { IntentManager } from '@djragsdale/intent-manager';

const intentManager = new IntentManager();

intentManager.loadUtteranceFromString('GetInfo get {object} info');

intentManager.on('intent:found', (intent) => {
  console.log(`Handling ${intent.name} the event way`);
});
intentManager.on('intent:notFound', ({ phrase }) => {
  console.log(`Could not match the phrase "${phrase}"`);
});

const intent = intentManager.matchIntent('get user info');

if (!intent) {
  console.error('Intent not found');
}
doSyncThings(intent);
```

### Streaming Into the Intent Manager

```javascript
import { IntentManager } from '@djragsdale/intent-manager';

const intentManager = new IntentManager();

intentManager.loadUtteranceFromString('GetInfo get {object} info');
intentManager.addIntentHandler({
  intentName: 'GetInfo',
  handler: (intent) => {
    console.log('Found intent', intent.name, intent.slots.object);
  },
});

process.stdin.pipe(intentManager);
```

### Streaming Out of the Intent Manager

```javascript
import { IntentManager } from '@djragsdale/intent-manager';

const intentManager = new IntentManager();

intentManager.loadUtteranceFromString('GetInfo get {object} info');
intentManager.addIntentHandler({
  intentName: 'GetInfo',
  handler: intent => `Found intent ${intent.name} ${intent.slots.object}\n`,
});

process.stdin.pipe(intentManager).pipe(process.stdout);
```
