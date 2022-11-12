import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { TextAnalyseLine, TextAnalyseToken } from '@app/chinesetextreader/api'
import {
  CedictResult,
  CedictResultCollection,
} from '@app/anki/components/zh/api'

interface Props {
  sentence: TextAnalyseLine
  focusWord: TextAnalyseToken | undefined
  setFocusWord: (word: TextAnalyseToken | undefined) => void
  defs: CedictResultCollection
}

const SentenceView = ({ sentence, focusWord, setFocusWord, defs }: Props) => (
  <p className="text-center text-4xl m-8">
    {sentence.tokens.map((w, i) => (
      <ruby
        className={`group ${
          w.start == focusWord?.start &&
          w.end == focusWord?.end &&
          focusWord.hanzi_traditional == w.hanzi_traditional
            ? 'bg-yellow-100 dark:bg-pink-300 dark:bg-opacity-20'
            : ''
        } ${
          defs[w.hanzi_traditional] &&
          defs[w.hanzi_traditional].results.length >= 1
            ? 'hover:bg-yellow-100 dark:hover:bg-green-800 cursor-pointer'
            : ''
        }`}
        key={i}
        onClick={() => {
          console.log('hasNoDef', defs)
          if (
            defs[w.hanzi_traditional] &&
            defs[w.hanzi_traditional].results.length >= 1
          ) {
            console.log('hasDef')
            if (focusWord?.start === w.start && focusWord?.end === w.end) {
              setFocusWord(undefined)
              console.log('set undefined')
            } else {
              setFocusWord(w)
              console.log('set', w)
            }
          }
        }}
      >
        {w.hanzi_traditional} <RubyText def={defs[w.hanzi_traditional]} />
      </ruby>
    ))}
  </p>
)

export default SentenceView

const RubyText = ({ def }: { def: CedictResult | undefined }) => {
  if (!def || def.results.length == 0) {
    return null
  }

  return (
    <rt className="opacity-0 group-hover:opacity-80 text-xs my-8">
      {def.results[0].pinyin_tones.toLowerCase()}
    </rt>
  )
}
