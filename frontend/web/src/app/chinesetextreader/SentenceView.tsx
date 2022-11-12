import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { TextAnalyseLine, TextAnalyseToken } from '@app/chinesetextreader/api'
import { CardType } from '@app/chinesemangareader/domain'
import {
  CedictResult,
  CedictResultCollection,
  CedictResultEntry,
  getCedictDefinitions,
} from '@app/anki/components/zh/api'
import FocusWordPanel from '@app/chinesetextreader/FocusWordPanel'

interface Props {
  sentence: TextAnalyseLine
  focusWord: TextAnalyseToken | undefined
  setFocusWord: Dispatch<SetStateAction<TextAnalyseToken | undefined>>
  exportWord: (
    cardType: CardType,
    def: CedictResultEntry,
    focusWord: TextAnalyseToken,
    sentence: string,
  ) => void
}

const SentenceView = ({
  sentence,
  focusWord,
  setFocusWord,
  exportWord,
}: Props) => {
  const [defs, setDefs] = useState<CedictResultCollection>({})

  useEffect(() => {
    getCedictDefinitions(sentence.tokens.map(t => t.hanzi_traditional)).then(
      res => setDefs(res),
    )
  }, [sentence])

  return (
    <div>
      <SentenceTranscript
        focusWord={focusWord}
        sentence={sentence}
        toggle={(word: TextAnalyseToken) => {
          if (focusWord?.start === word.start && focusWord?.end === word.end) {
            setFocusWord(undefined)
          } else {
            setFocusWord(word)
          }
        }}
        defs={defs}
      />
      <FocusWordPanel
        word={focusWord}
        exportWord={async (cardType, def) => {
          if (!focusWord) {
            return
          }

          return exportWord(
            cardType,
            def,
            focusWord,
            sentence.tokens.map(t => t.hanzi_traditional).join(''),
          )
        }}
        setFocusWord={setFocusWord}
        defs={defs}
      />
    </div>
  )
}

export default SentenceView

const SentenceTranscript = ({
  sentence,
  toggle,
  focusWord,
  defs,
}: {
  sentence: TextAnalyseLine
  toggle: (word: TextAnalyseToken) => void
  focusWord: TextAnalyseToken | undefined
  defs: CedictResultCollection
}) => (
  <p className="text-center text-4xl m-8">
    {sentence.tokens.map((w, i) => (
      <ruby
        className={`group ${
          w.start == focusWord?.start && w.end == focusWord?.end
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
          if (
            defs[w.hanzi_traditional] &&
            defs[w.hanzi_traditional].results.length >= 1
          ) {
            toggle(w)
          }
        }}
      >
        {w.hanzi_traditional} <RubyText def={defs[w.hanzi_traditional]} />
      </ruby>
    ))}
  </p>
)

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
