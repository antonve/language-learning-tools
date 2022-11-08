import { root } from '@app/anki/api'

export const textAnalyse = async (text: string): Promise<any> => {
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
