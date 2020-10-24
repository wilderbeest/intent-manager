class Intent {
  readonly name: string;
  readonly phrase: string;
  readonly slots: any;
  readonly slotValues: Array<any>;
  readonly utterance: any;

  constructor(options: any) {
    // TODO: Validate options

    this.utterance = options.utterance; // What is listed as the utterance for the intent
    this.phrase = options.phrase; // What the user sends
    this.name = options.name;
    this.slots = options.slots || {};
    this.slotValues = options.slotValues || [];
  }

  toString() {
    return this.name;
  }
}

export default Intent;
export type {
  Intent,
};