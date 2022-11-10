import { root } from '@app/anki/api'

export interface TextAnalyseToken {
  hanzi_traditional: string
  hanzi_simplified: string
  start: number
  end: number
}

export interface TextAnalyseLine {
  simplified: string
  traditional: string
  tokens: TextAnalyseToken[]
}

export interface TextAnalyseResponse {
  lines: TextAnalyseLine[]
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
