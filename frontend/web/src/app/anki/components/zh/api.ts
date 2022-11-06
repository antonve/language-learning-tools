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

export interface PendingCardsResponse {
  cards: {
    id: number
    token: string
    meta: {
      sentence: string
      card_type: string
      hanzi_traditional: string | undefined
      hanzi_simplified: string | undefined
      pinyin: string | undefined
      pinyin_tones: string | undefined
      meanings: string[]
    }
  }[]
}

export const getPendingCards = async (): Promise<PendingCardsResponse> => {
  const url = `${root}/pending_cards?language_code=zho`
  const response = await fetch(url)

  if (response.status !== 200) {
    return {
      cards: [],
    }
  }

  const body = await response.json()

  return body
}

export const markCardAsExported = async (id: number): Promise<void> => {
  const url = `${root}/pending_cards/${id}/mark`
  const response = await fetch(url, { method: 'post' })

  if (response.status !== 200) {
    return Promise.reject()
  }
}
