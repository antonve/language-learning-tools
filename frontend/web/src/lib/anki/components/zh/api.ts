import { root } from 'src/lib/anki/api'

export interface CedictResult {
  source: string
  results: CedictResultEntry[]
}

export interface CedictResultEntry {
  pinyin_tones: string
  pinyin: string
  hanzi_simplified: string
  hanzi_traditional: string
  meanings: string[]
}

export type CedictResultCollection = { [key: string]: CedictResult }

export interface ZdicResult {
  source: string
  pinyin?: string
  zhuyin?: string
  audio_url?: string
  definition: string
}

export const getCedictDefinition = async (
  word: string,
): Promise<CedictResult> => {
  const url = `${root}/zh_TW/cedict`
  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({
      words: [word],
    }),
  })

  if (response.status !== 200) {
    return {
      source: word,
      results: [],
    }
  }

  const body = await response.json()

  return body[word]
}

export const getCedictDefinitions = async (
  words: string[],
): Promise<CedictResultCollection> => {
  const url = `${root}/zh_TW/cedict`
  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({
      words: words,
    }),
  })

  if (response.status !== 200) {
    return {}
  }

  const body = await response.json()
  return body
}

export const getZdicDefinition = async (word: string): Promise<ZdicResult> => {
  const url = `${root}/zh_TW/zdic/${encodeURI(word)}`
  const response = await fetch(url)

  if (response.status !== 200) {
    return {
      source: word,
      definition: '',
    }
  }

  const body = await response.json()

  return body
}
