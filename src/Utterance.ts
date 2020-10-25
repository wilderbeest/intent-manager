interface Utterance {
  intent: string,
  phrase: string,
  slots: Array<string>,
}

export type {
  Utterance,
};
