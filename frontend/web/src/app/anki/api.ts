import { Sentence, SentencesResult, Chapter } from '@app/anki/domain'
import getConfig from 'next/config'

const { publicRuntimeConfig } = getConfig()

export const root = publicRuntimeConfig.API_ROOT || 'http://localhost:8080'

export const getChapter = async (
  lang: string,
  series: string,
  filename: string,
): Promise<Chapter> => {
  const url = `${root}/${lang}/chapter/${encodeURI(series)}/${filename}`
  const response = await fetch(url)

  if (response.status !== 200) {
    throw new Error('not found')
  }

  const body = await response.json()

  return body
}

export const getSentences = async (
  lang: string,
  word: string,
): Promise<SentencesResult> => {
  const url = `${root}/${lang}/corpus/${encodeURI(word)}`
  const response = await fetch(url)

  if (response.status !== 200) {
    return {
      results: [],
    }
  }

  const body = await response.json()

  const sentences = body.results.map((s: Sentence) => ({
    ...s,
    line: s.line.trim(),
    original: s.line.trim(),
  }))

  sentences.sort((a: Sentence, b: Sentence) => {
    if (a.line.length > b.line.length) {
      return 1
    }
    if (a.line.length < b.line.length) {
      return -1
    }
    return 0
  })

  return {
    results: sentences,
  }
}

export const addAnkiNote = async (request: any): Promise<any> => {
  const url = 'http://127.0.0.1:8765'
  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(request),
  })
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

export const getPendingCards = async (
  languageCode: string,
): Promise<PendingCardsResponse> => {
  const url = `${root}/pending_cards?language_code=${languageCode}`
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

export const updatePendingCard = async (
  id: number,
  meta: Object,
): Promise<void> => {
  const url = `${root}/pending_cards/${id}`

  const response = await fetch(url, {
    method: 'put',
    body: JSON.stringify({ meta }),
  })

  if (response.status !== 200) {
    return Promise.reject()
  }
}
