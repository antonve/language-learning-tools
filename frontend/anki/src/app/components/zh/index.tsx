import {
  formatDefinitions,
  nl2br,
  sentenceWithFocusWord,
  sourceForSentence,
  Word,
} from '@app/domain'
import { useEffect, useState } from 'react'
import { getCedictDefinition, getZdicDefinition } from './api'

export const dictionaries: { name: string; url: (word: string) => string }[] = [
  {
    name: 'MDBG',
    url: word =>
      `https://www.mdbg.net/chinese/dictionary?page=worddict&wdrst=1&wdqb=${encodeURI(
        word,
      )}`,
  },
]

interface EnglishDefinitionResult {
  word: string
  pinyin: {
    raw?: string
    pretty?: string
  }
  hanzi: {
    simplified?: string
    traditional?: string
  }
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
      pinyin: {},
      hanzi: {},
      definition: undefined,
      finished: false,
    })

    const update = async () => {
      const req = await getCedictDefinition(word)
      const defs = req.meanings.map(m => ({
        meaning: m,
      }))
      const def = formatDefinitions(defs)

      setDefinition({
        word,
        pinyin: {
          raw: req.pinyin,
          pretty: req.pinyin_tones,
        },
        hanzi: {
          simplified: req.hanzi_simplified,
          traditional: req.hanzi_traditional,
        },
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

interface ChineseDefinitionResult {
  word: string
  pinyin?: string
  zhuyin?: string
  audioUrl?: string
  definition: string | undefined
  finished: boolean
}

export const useChineseDefinition = (word: string | undefined) => {
  const [definition, setDefinition] = useState(
    undefined as ChineseDefinitionResult | undefined,
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
      const req = await getZdicDefinition(word)

      setDefinition({
        word,
        pinyin: req.pinyin,
        zhuyin: req.zhuyin,
        audioUrl: req.audio_url,
        definition: req.definition,
        finished: true,
      })
    }

    update()
  }, [word])

  return {
    definition,
  }
}

const deckName = '2. Chinese::Mined'
export const exportRequestForWord = (word: Word) => ({
  action: 'addNote',
  version: 6,
  params: {
    note: {
      deckName,
      modelName: 'chinese native with focus word',
      fields: {
        Expression: sentenceWithFocusWord(word),
        Focus: word.value,
        Pinyin: word.meta.reading,
        Zhuyin: word.meta.zhuyin,
        EnglishDefinition: nl2br(word.meta.definitionEnglish),
        ChineseDefinition: nl2br(word.meta.definitionTargetLanguage),
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
        'chinese',
        'mined',
        'native',
        word.meta.sentence?.series,
      ].filter(t => t !== undefined),
      audio: {
        filename: `chinese_word_${word.value}.mp3`,
        url: word.meta.audioUrl,
        fields: ['Audio'],
      },
    },
  },
})
