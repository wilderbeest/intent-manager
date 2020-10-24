class Intent {
  name: string;
  phrase: string;
  slots: Array<any>;
  utterance: any;

  constructor(options: any) {
    // TODO: Validate options

    this.utterance = options.utterance // What is listed as the utterance for the intent
    this.phrase = options.phrase // What the user sends
    this.name = options.name
    this.slots = options.slots || []
  }

  getSlot(slotName: string): any {
    const match = this.slots.find(slot => slot.name === slotName)
    if (match) {
      return match.value
    }
  }
}

export default Intent;
export type {
  Intent,
};
