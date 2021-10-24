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

interface DefinitionResult {
  word: string
  definition: string | undefined
  finished: boolean
}

export const useEnglishDefition = (word: string | undefined) => {
  const [definition, setDefinition] = useState(
    undefined as DefinitionResult | undefined,
  )

  useEffect(() => {
    if (word === undefined) {
      setDefinition(undefined)
      return
    }

    setDefinition({
      word,
      definition: undefined,
      finished: false,
    })

    const update = async () => {
      const req = await getJishoDefinition(word)
      const def = formatDefinitions(req.definitions)

      setDefinition({
        word,
        definition: def,
        finished: true,
      })
    }

    update()
  }, [word])

  return {
    definition,
  }
}
