import { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'

import {
  Chapter,
  Collection,
  SentencesResult,
  Word,
  WordCollection,
} from 'src/lib/anki/domain'
import { getChapter, getSentences } from 'src/lib/anki/api'

export const useSentences = (lang: string, word: Word | undefined) => {
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
      const sentences = await getSentences(lang, word.meta.highlight)
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
  lang: string,
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

      const req = await getChapter(lang, series, filename).catch(() => fallback)

      setChapter({
        chapter: req,
        finished: true,
      })
    }

    update()
  }, [series, filename])

  return chapter
}

export const useWordCollection = (languageCode: string) => {
  const [collection, setCollection] = useState({
    words: {},
    selectedId: undefined,
  } as Collection)

  const collectionName = `collection_${languageCode}`
  const setPersistedCollection = (newCollection: Collection) => {
    localStorage.setItem(collectionName, JSON.stringify(newCollection))
    setCollection(newCollection)
  }

  useEffect(() => {
    const cachedCollection = localStorage.getItem(collectionName)
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
            definitionTargetLanguage: undefined,
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

  const importWords = (words: Word[]) => {
    const existingExternalIds = new Set(
      Object.values(collection.words)
        .map(it => it.meta.externalId)
        .filter(it => it != undefined),
    )
    const filtered = words.filter(
      it => !existingExternalIds.has(it.meta.externalId),
    )

    const newCollection: WordCollection = filtered.reduce(
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
    importWords,
    cleanWords,
    deleteWord,
    selectedWordId: collection.selectedId,
    setSelectedWordId,
  }
}
