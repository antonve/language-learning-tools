import { root } from '@app/anki/api'

export interface CedictResult {
  source: string
  pinyin_tones?: string
  pinyin?: string
  hanzi_simplified?: string
  hanzi_traditional?: string
  meanings: string[]
}

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
  const url = `${root}/zh/cedict`
  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({
      words: [word],
    }),
  })

  if (response.status !== 200) {
    return {
      source: word,
      meanings: [],
    }
  }

  const body = await response.json()

  return body[word]
}

export const getZdicDefinition = async (word: string): Promise<ZdicResult> => {
  const url = `${root}/zh/zdic/${encodeURI(word)}`
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
