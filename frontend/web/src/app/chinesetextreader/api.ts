import { root } from '@app/anki/api'

interface TextAnalyseResponse {
  lines: {
    simplified: string
    traditional: string
    tokens: {
      hanzi_traditional: string
      hanzi_simplified: string
      start: number
      end: number
      dictionary_entry:
        | {
            pinyin_tones: string
            pinyin: string
            meanings: string[]
          }
        | undefined
    }[]
  }[]
}

export const textAnalyse = async (
  text: string,
): Promise<TextAnalyseResponse> => {
  const url = `${root}/zh/text-analyse`
  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({ text }),
  })

  if (response.status !== 200) {
    throw new Error('could not analyse text')
  }

  const body = await response.json()

  return body
}
