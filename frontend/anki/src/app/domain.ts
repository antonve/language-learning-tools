export interface Collection {
  words: WordCollection
  selectedId: string | undefined
}

export const availableLanguages: { [code: string]: Language } = {
  ja: { code: 'ja', name: 'Japanese' },
  zh: { code: 'zh', name: 'Mandarin' },
}

export interface Language {
  code: string
  name: string
}

export type WordCollection = { [key: string]: Word }

export interface Word {
  value: string
  done: boolean
  meta: WordMeta
}

export interface ChineseReading {
  pinyin?: string
  zhuyin?: string
}

export interface WordMeta {
  sentence: Sentence | undefined
  reading: string | ChineseReading | undefined
  definitionEnglish: string | undefined
  definitionTargetLanguage: string | undefined
  audioUrl: string | undefined
  vocabCard: boolean
  highlight: string | undefined
}

interface Definition {
  meaning: string
}

export interface Sentence {
  language: string
  series: string | undefined
  filename: string | undefined
  chapter: string | undefined
  line: string
  original: string | undefined
}

export interface Chapter {
  filename: string
  series: string
  title: string
  body: string
}

export interface SentencesResult {
  results: Sentence[]
}

export const formatDefinitions = (defs: Definition[]): string => {
  return defs.map((d, i) => `${i + 1}. ${d.meaning}`).join('\n')
}

export const compareSentences = (s1: Sentence, s2: Sentence): boolean =>
  s1.original == s2.original &&
  s1.series == s2.series &&
  s1.filename === s2.filename

export const sourceForSentence = (
  sentence: Sentence | undefined,
): string | undefined => {
  const { series, chapter } = sentence ?? {
    sentence: undefined,
    chapter: undefined,
  }

  if (series === undefined || chapter === undefined) {
    return undefined
  }

  return `${series} - ${chapter}`
}

export const sentenceWithFocusWord = (word: Word): string => {
  if (word.meta.sentence === undefined) {
    return ''
  }

  const target = word.meta.highlight ?? word.value
  return word.meta.sentence.line.replaceAll(target, `<b>${target}</b>`)
}
