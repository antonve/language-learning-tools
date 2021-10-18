interface JishoResult {
  word: string
  definitions: Definition[]
}

interface Definition {
  meaning: string
}

const root = 'http://localhost:5555'

export const getJishoDefinition = async (word: string): JishoResult => {
  const url = `${root}/jisho/${encodeURI(word)}`
  const response = await fetch(url)
  const body = await response.json()

  return body
}
