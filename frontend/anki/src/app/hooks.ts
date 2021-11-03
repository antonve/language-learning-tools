import { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'

import {
  Chapter,
  Collection,
  formatDefinitions,
  Sentence,
  SentencesResult,
  Word,
  WordCollection,
} from '@app/domain'
import {
  getChapter,
  getGooDefinition,
  getJishoDefinition,
  getSentences,
} from '@app/api'

export const useSentences = (word: Word | undefined) => {
  const [sentences, setSentences] = useState(
    undefined as SentencesResult | undefined,
  )

  useEffect(() => {
    if (word === undefined || word.meta.highlight === undefined) {
      return
    }
    const update = async () => {
      if (word.meta.highlight === undefined) {
        return
      }
      const sentences = await getSentences(word.meta.highlight)
      setSentences(sentences)
    }
    update()
  }, [word?.meta.highlight])

  return {
    sentences,
  }
}

interface ChapterResult {
  chapter: Chapter | undefined
  finished: boolean
}

export const useChapter = (
  series: string | undefined,
  filename: string | undefined,
) => {
  const empty: ChapterResult = {
    chapter: undefined,
    finished: false,
  }
  const [chapter, setChapter] = useState(empty)

  useEffect(() => {
    if (series === undefined || filename === undefined) {
      setChapter(empty)
      return
    }

    setChapter(empty)

    const update = async () => {
      if (series === undefined || filename === undefined) {
        return
      }

      const fallback: Chapter = {
        series: series,
        filename: filename,
        title: 'Not found',
        body: 'Something went wrong here.',
      }

      const req = await getChapter(series, filename).catch(() => fallback)

      setChapter({
        chapter: req,
        finished: true,
      })
    }

    update()
  }, [series, filename])

  return chapter
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

  const setPersistedCollection = (newCollection: Collection) => {
    localStorage.setItem('collection', JSON.stringify(newCollection))
    setCollection(newCollection)
  }

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

  const updateWord = (newWord: Word, id: string, selectedWordId?: string) => {
    if (collection.words[id] === undefined) {
      return
    }

    const words = { ...collection.words, [id]: newWord }
    const newCollection = {
      words,
      selectedId: selectedWordId ?? collection.selectedId,
    }
    setPersistedCollection(newCollection)
  }

  const setSelectedWordId = (id: string | undefined) => {
    setCollection({ words: collection.words, selectedId: id })
  }

  const setWords = (words: WordCollection) => {
    setPersistedCollection({
      words,
      selectedId: collection.selectedId,
    })
  }

  const addWords = (rawWords: string[]) => {
    const newWords: Word[] = rawWords.map(
      value =>
        ({
          value,
          done: false,
          meta: {
            sentence: undefined,
            reading: undefined,
            definitionEnglish: undefined,
            definitionJapanese: undefined,
            vocabCard: true,
            highlight: value,
          },
        } as Word),
    )
    const newCollection: WordCollection = newWords.reduce(
      (collection, word) => {
        collection[uuidv4()] = word
        return collection
      },
      {} as WordCollection,
    )

    setWords({ ...collection.words, ...newCollection })
  }

  const deleteWord = (id: string) => {
    const newCollection = { ...collection.words }
    delete newCollection[id]

    setPersistedCollection({
      words: newCollection,
      selectedId:
        collection.selectedId === id ? undefined : collection.selectedId,
    })
  }

  const cleanWords = () => {
    const newCollection = { ...collection.words }

    for (const id of Object.keys(collection.words)) {
      const word = collection.words[id]

      if (word.done) {
        delete newCollection[id]
      }
    }

    setPersistedCollection({
      words: newCollection,
      selectedId:
        collection.words[collection.selectedId ?? 'none'] === undefined
          ? undefined
          : collection.selectedId,
    })
  }

  return {
    words: collection.words,
    updateWord,
    addWords,
    cleanWords,
    deleteWord,
    selectedWordId: collection.selectedId,
    setSelectedWordId,
  }
}
