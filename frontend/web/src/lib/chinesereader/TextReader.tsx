import type { NextPage } from 'next'
import {
  exportWordToAnki,
  Text,
  textAnalyse,
  TextAnalyseResponse,
  TextAnalyseToken,
  updateLastPositionText,
} from 'src/lib/chinesereader/domain'
import { useEffect, useState } from 'react'
import Button from 'src/lib/anki/components/Button'
import SentenceView from './SentenceView'
import { useKeyPress } from 'src/lib/chinesereader/hooks'
import {
  CedictResultCollection,
  getCedictDefinitions,
} from 'src/lib/anki/components/zh/api'
import FocusWordPanel from './FocusWordPanel'

interface Props {
  text: Text
}

const TextReader: NextPage<Props> = ({ text }) => {
  const [analyse, setAnalyse] = useState<TextAnalyseResponse>()
  const [lineIndex, setLineIndex] = useState<number>(text.last_position ?? 0)
  const [focusWord, setFocusWord] = useState<TextAnalyseToken | undefined>()
  const [defs, setDefs] = useState<CedictResultCollection>({})

  const sentence = analyse?.lines[lineIndex]?.tokens.map(
    t => t.hanzi_traditional,
  )

  useEffect(() => {
    if (!sentence) {
      return
    }
    getCedictDefinitions(sentence).then(res => setDefs(res))
  }, [sentence?.join('')])

  const onNextSentence = () => {
    if (analyse && lineIndex < analyse.lines.length) {
      setLineIndex(lineIndex + 1)
      setFocusWord(undefined)
    }
  }
  const onPrevSentence = () => {
    if (lineIndex >= 1) {
      setLineIndex(lineIndex - 1)
      setFocusWord(undefined)
    }
  }

  useKeyPress('ArrowLeft', onPrevSentence)
  useKeyPress('ArrowRight', onNextSentence)

  useEffect(() => {
    textAnalyse(text.content).then(res => setAnalyse(res))
  }, [text])

  useEffect(() => {
    if (!text.id || lineIndex <= (text.last_position ?? 0)) {
      return
    }
    updateLastPositionText(text.id, lineIndex).then(() =>
      console.log('new position saved', lineIndex),
    )
  }, [text, lineIndex])

  if (!analyse) {
    return <p>Loading...</p>
  }

  const charCount = analyse.lines
    .slice(0, lineIndex)
    .map(l => l.traditional.length)
    .reduce((prev, cur) => cur + prev, 0)

  return (
    <div className="flex justify-between space-x-10 md:space-x-2 flex-grow mt-10">
      <Button
        onClick={onPrevSentence}
        disabled={lineIndex <= 0}
        overrides={`dark:border-none dark:bg-gray-900 w-32 text-4xl shrink-0 md:w-20`}
      >
        &larr;
      </Button>
      <div className="flex flex-col flex-grow pt-5">
        {lineIndex < analyse.lines.length ? (
          <>
            <SentenceView
              sentence={analyse.lines[lineIndex]}
              focusWord={focusWord}
              setFocusWord={setFocusWord}
              addDef={def => setDefs({ ...defs, [def.source]: def })}
            />
            <div className="flex-grow md:py-5">
              <FocusWordPanel
                word={focusWord}
                exportWord={async (cardType, def) => {
                  if (!focusWord || !sentence) {
                    return
                  }

                  return exportWordToAnki(
                    cardType,
                    def,
                    focusWord,
                    sentence.join(''),
                  )
                }}
                resetFocusWord={() => setFocusWord(undefined)}
                defs={defs}
              />
            </div>
          </>
        ) : null}
        <div className="space-x-10 flex justify-between">
          <span
            onClick={() => {
              const p =
                parseInt(
                  window.prompt(`Skip to line (max ${analyse.lines.length})`) ??
                    '0',
                ) - 1
              if (p >= 0 && p < analyse.lines.length) {
                setLineIndex(p)
              }
            }}
            className="cursor-pointer text-center"
          >
            {lineIndex == analyse.lines.length
              ? 'Summary'
              : `${lineIndex + 1} / ${analyse.lines.length}`}
          </span>
          <span>{charCount} characters read</span>
          <span>{charCount / 400} pages read</span>
        </div>
      </div>
      <Button
        onClick={onNextSentence}
        disabled={lineIndex > analyse.lines.length - 1}
        overrides={`dark:border-none dark:bg-gray-900 w-32 text-4xl shrink-0 md:w-20`}
      >
        &rarr;
      </Button>
    </div>
  )
}

export default TextReader
