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

export interface SentencesResult {
  results: Sentence[]
}

export const formatDefinitions = (defs: Definition[]): string => {
  return defs.map((d, i) => `${i + 1}. ${d.meaning}`).join('\n\n')
}

export const compareSentences = (s1: Sentence, s2: Sentence): boolean =>
  s1.line == s2.line && s1.series == s2.series && s1.filename === s2.filename
