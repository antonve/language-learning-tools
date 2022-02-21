export interface Collection {
  words: WordCollection
  selectedId: string | undefined
}

export type WordCollection = { [key: string]: Word }

export interface Word {
  value: string
  done: boolean
  meta: WordMeta
}

export interface WordMeta {
  sentence: Sentence | undefined
  reading: string | undefined
  definitionEnglish: string | undefined
  definitionJapanese: string | undefined
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

export const dictionaries: { name: string; url: (word: string) => string }[] = [
  {
    name: 'ALC',
    url: word => `http://eow.alc.co.jp/search?q=${encodeURI(word)}`,
  },
  {
    name: 'Jisho',
    url: word => `https://jisho.org/search/${encodeURI(word)}`,
  },
  {
    name: 'Goo',
    url: word => `http://dictionary.goo.ne.jp/srch/all/${encodeURI(word)}/m0u/`,
  },
  {
    name: 'Google',
    url: word => `https://www.google.com/search?q=${encodeURI(word)}`,
  },
  {
    name: 'Kotobank',
    url: word => `https://kotobank.jp/gs/?q=${encodeURI(word)}`,
  },
  {
    name: 'Weblio',
    url: word => `https://www.weblio.jp/content/${encodeURI(word)}`,
  },
  {
    name: 'Syosetu',
    url: word =>
      `https://www.google.com/search?q=site%3Ancode.syosetu.com%2F+%22${encodeURI(
        word,
      )}%22`,
  },
  {
    name: 'Idioms',
    url: word => `https://idiom-encyclopedia.com/?s=${encodeURI(word)}`,
  },
  {
    name: 'Rei',
    url: word => `http://yourei.jp/${encodeURI(word)}`,
  },
]

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
