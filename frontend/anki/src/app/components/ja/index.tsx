import {
  formatDefinitions,
  nl2br,
  sentenceWithFocusWord,
  sourceForSentence,
  Word,
} from '@app/domain'
import { useEffect, useState } from 'react'
import { getGooDefinition, getJishoDefinition } from './api'

export const dictionaries: { name: string; url: (word: string) => string }[] = [
  {
    name: 'ALC',
    url: word => `http://eow.alc.co.jp/search?q=${encodeURI(word)}`,
  },
  {
    name: 'Jisho',
    url: word => `https://jisho.org/search/${encodeURI(word)}`,
  },
  {
    name: 'Goo',
    url: word => `http://dictionary.goo.ne.jp/srch/all/${encodeURI(word)}/m0u/`,
  },
  {
    name: 'Google',
    url: word => `https://www.google.com/search?q=${encodeURI(word)}`,
  },
  {
    name: 'Kotobank',
    url: word => `https://kotobank.jp/gs/?q=${encodeURI(word)}`,
  },
  {
    name: 'Weblio',
    url: word => `https://www.weblio.jp/content/${encodeURI(word)}`,
  },
  {
    name: 'Syosetu',
    url: word =>
      `https://www.google.com/search?q=site%3Ancode.syosetu.com%2F+%22${encodeURI(
        word,
      )}%22`,
  },
  {
    name: 'Idioms',
    url: word => `https://idiom-encyclopedia.com/?s=${encodeURI(word)}`,
  },
  {
    name: 'Rei',
    url: word => `http://yourei.jp/${encodeURI(word)}`,
  },
]

interface EnglishDefinitionResult {
  word: string
  definition: string | undefined
  finished: boolean
}

export const useEnglishDefinition = (word: string | undefined) => {
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

export const useJapaneseDefinition = (word: string | undefined) => {
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

const deckName = '3. Japanese::3. Vocab'
export const exportRequestForWord = (word: Word) => ({
  action: 'addNote',
  version: 6,
  params: {
    note: {
      deckName,
      modelName: 'ankiminer_jp',
      fields: {
        Expression: sentenceWithFocusWord(word),
        Focus: word.value,
        Reading: word.meta.reading,
        EnglishDefinition: nl2br(word.meta.definitionEnglish),
        JapaneseDefinition: nl2br(word.meta.definitionTargetLanguage),
        VocabOnlyCard: word.meta.vocabCard ? '1' : '',
        Source: sourceForSentence(word.meta.sentence),
      },
      options: {
        allowDuplicate: false,
        duplicateScope: 'deck',
        duplicateScopeOptions: {
          deckName,
          checkChildren: false,
          checkAllModels: false,
        },
      },
      tags: [
        'ankiminer',
        'japanese',
        'mined',
        'native',
        word.meta.sentence?.series,
      ].filter(t => t !== undefined),
    },
  },
})
