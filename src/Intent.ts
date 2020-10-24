class Intent {
  name: string;
  phrase: string;
  slots: any;
  slotValues: Array<any>;
  utterance: any;

  constructor(options: any) {
    // TODO: Validate options

    this.utterance = options.utterance; // What is listed as the utterance for the intent
    this.phrase = options.phrase; // What the user sends
    this.name = options.name;
    this.slots = options.slots || {};
    this.slotValues = options.slotValues || [];
  }
}

export default Intent;
export type {
  Intent,
};