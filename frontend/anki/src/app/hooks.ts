import { useState, useEffect } from 'react'

import {
  Collection,
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
  const [collection, setCollection] = useState({
    words: {},
    selectedId: undefined,
  } as Collection)

  useEffect(() => {
    const cachedCollection = localStorage.getItem('collection')
    if (cachedCollection !== null) {
      const newCollection: Collection = JSON.parse(cachedCollection)
      if (newCollection.selectedId === undefined) {
        newCollection.selectedId =
          Object.keys(newCollection.words)[0] ?? undefined
      }

      setCollection(newCollection)
    }
  }, [])

  const updateWord = (newWord: Word, id: string) => {
    if (collection.words[id] === undefined) {
      return
    }

    const words = { ...collection.words, [id]: newWord }
    const newCollection = { words, selectedId: collection.selectedId }
    localStorage.setItem('collection', JSON.stringify(newCollection))
    setCollection(newCollection)
  }

  const setSelectedWordId = (id: string | undefined) => {
    setCollection({ words: collection.words, selectedId: id })
  }

  return {
    words: collection.words,
    updateWord,
    selectedWordId: collection.selectedId,
    setSelectedWordId,
  }
}
