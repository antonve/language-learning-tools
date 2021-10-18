export interface Word {
  id: number
  value: string
  done: boolean
  meta: WordMeta | undefined
}

export interface WordMeta {
  sentence: Sentence | undefined
  reading: string | undefined
  definitionEnglish: string | undefined
  definitionJapanese: string | undefined
  vocabCard: boolean
}
