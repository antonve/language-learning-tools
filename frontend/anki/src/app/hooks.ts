import { useState, useEffect } from 'react'

import {
  formatDefinitions,
  SentencesResult,
  Word,
  WordCollection,
  WordMeta,
} from '@app/domain'
import { getGooDefinition, getJishoDefinition, getSentences } from '@app/api'

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

interface EnglishDefinitionResult {
  word: string
  definition: string | undefined
  finished: boolean
}

export const useEnglishDefition = (word: string | undefined) => {
  const [definition, setDefinition] = useState(
    undefined as EnglishDefinitionResult | undefined,
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
      const req = await getJishoDefinition(word).catch(() => ({
        definitions: [],
      }))
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

interface JapaneseDefinitionResult {
  word: string
  definition: string | undefined
  reading: string | undefined
  finished: boolean
}

export const useJapaneseDefition = (word: string | undefined) => {
  const [definition, setDefinition] = useState(
    undefined as JapaneseDefinitionResult | undefined,
  )

  useEffect(() => {
    if (word === undefined) {
      setDefinition(undefined)
      return
    }

    setDefinition({
      word,
      definition: undefined,
      reading: undefined,
      finished: false,
    })

    const update = async () => {
      const req = await getGooDefinition(word).catch(() => ({
        definition: undefined,
        reading: undefined,
      }))

      setDefinition({
        word,
        definition: req.definition,
        reading: req.reading,
        finished: true,
      })
    }

    update()
  }, [word])

  return {
    definition,
  }
}

export const useWordCollection = () => {
  const [words, setWords] = useState(() => {
    const emptyMeta: WordMeta = {
      sentence: undefined,
      reading: undefined,
      definitionEnglish: undefined,
      definitionJapanese: undefined,
      vocabCard: false,
    }

    return {
      '33935dba-b20f-4fd6-9d9e-80c7f2309aea': {
        value: '手が回らない',
        done: true,
        meta: { ...emptyMeta },
      },
      '5ef77e40-1a26-43fc-a58b-7c9012d710ef': {
        value: '足を運んで',
        done: true,
        meta: { ...emptyMeta },
      },
      'b5b16715-7bdc-4093-8215-4ccba33d48c4': {
        value: '不甲斐ない',
        done: true,
        meta: { ...emptyMeta },
      },
      'ccf31c8e-3df9-4f2f-9221-f6a753961c6b': {
        value: 'おろおろ',
        done: true,
        meta: { ...emptyMeta },
      },
      '4a433e60-dcbb-4549-aec0-6d9102199957': {
        value: '旅の恥はかき捨て',
        done: false,
        meta: { ...emptyMeta },
      },
      '5a4305c0-8491-433c-af2e-bef517c2b6a7': {
        value: '憤懣',
        done: false,
        meta: { ...emptyMeta },
      },
      'abe45caa-3f87-4b7d-b5df-7f3e09c90032': {
        value: '溜飲',
        done: false,
        meta: { ...emptyMeta },
      },
      '724c1b68-2971-4a78-a755-b829de022ef5': {
        value: '翻弄',
        done: false,
        meta: { ...emptyMeta },
      },
    } as WordCollection
  })

  const updateWord = (newWord: Word, id: string) => {
    if (words[id] === undefined) {
      return
    }

    setWords({ ...words, [id]: newWord })
  }

  return { words, updateWord }
}
