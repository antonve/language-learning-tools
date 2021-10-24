import { useState, useEffect } from 'react'

import { formatDefinitions, SentencesResult } from '@app/domain'
import { getJishoDefinition, getSentences } from '@app/api'

export const useSentences = (word: string | undefined) => {
  const [sentences, setSentences] = useState(
    undefined as SentencesResult | undefined,
  )

  useEffect(() => {
    if (word === undefined) {
      return
    }
    const update = async () => {
      const sentences = await getSentences(word)
      setSentences(sentences)
    }
    update()
  }, [word])

  return {
    sentences,
  }
}

export const useEnglishDefition = (word: string | undefined) => {
  const [definition, setDefinition] = useState(undefined as string | undefined)

  useEffect(() => {
    if (word === undefined) {
      return
    }
    setDefinition(undefined)
    const update = async () => {
      const req = await getJishoDefinition(word)
      const def = formatDefinitions(req.definitions)
      setDefinition(def)
    }
    update()
  }, [word])

  return {
    definition,
  }
}
