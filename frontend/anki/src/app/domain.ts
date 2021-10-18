export type WordCollection = { [key: string]: Word }

export interface Word {
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

interface Definition {
  meaning: string
}

export interface Sentence {
  series: string
  filename: string
  chapter: string
  line: string
}

export const formatDefinitions = (defs: Definition[]): string => {
  return defs.map((d, i) => `${i + 1}. ${d.meaning}`).join('\n\n')
}
