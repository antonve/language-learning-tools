import { root } from 'src/lib/anki/api'

interface JishoResult {
  word: string
  definitions: Definition[]
}

interface GooResult {
  word: string
  definition: string
  reading: string
}

interface Definition {
  meaning: string
}

export const getJishoDefinition = async (
  word: string,
): Promise<JishoResult> => {
  const url = `${root}/jp/jisho/${encodeURI(word)}`
  const response = await fetch(url)

  if (response.status !== 200) {
    return {
      word,
      definitions: [],
    }
  }

  const body = await response.json()

  return body
}

export const getGooDefinition = async (word: string): Promise<GooResult> => {
  const url = `${root}/jp/goo/${encodeURI(word)}`
  const response = await fetch(url)

  if (response.status !== 200) {
    return {
      word,
      definition: '',
      reading: '',
    }
  }

  const body = await response.json()

  return body
}
