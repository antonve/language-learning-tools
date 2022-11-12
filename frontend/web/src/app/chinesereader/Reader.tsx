import type { NextPage } from 'next'
import {
  exportWordToAnki,
  textAnalyse,
  TextAnalyseResponse,
  TextAnalyseToken,
} from '@app/chinesereader/domain'
import { useEffect, useState } from 'react'
import Button from '@app/anki/components/Button'
import SentenceView from './SentenceView'
import { useKeyPress } from '@app/chinesereader/hooks'
import {
  CedictResultCollection,
  getCedictDefinitions,
} from '@app/anki/components/zh/api'
import FocusWordPanel from './FocusWordPanel'

interface Props {
  text: string
}

const Reader: NextPage<Props> = ({ text }) => {
  const [analyse, setAnalyse] = useState<TextAnalyseResponse>()
  const [lineIndex, setLineIndex] = useState<number>(0)
  const [focusWord, setFocusWord] = useState<TextAnalyseToken | undefined>()
  const [defs, setDefs] = useState<CedictResultCollection>({})

  const sentence = analyse?.lines[lineIndex].tokens.map(
    t => t.hanzi_traditional,
  )

  useEffect(() => {
    if (!sentence) {
      return
    }
    getCedictDefinitions(sentence).then(res => setDefs(res))
  }, [sentence?.join('')])

  const onNextSentence = () => {
    if (analyse && lineIndex < analyse.lines.length - 1) {
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
    textAnalyse(text).then(res => setAnalyse(res))
  }, [text])

  if (!analyse) {
    return <p>Loading...</p>
  }

  return (
    <div className="flex justify-between space-x-10 flex-grow">
      <Button
        onClick={onPrevSentence}
        disabled={lineIndex <= 0}
        overrides={`dark:border-none dark:bg-gray-900 w-32 text-4xl shrink-0`}
      >
        &larr;
      </Button>
      <div>
        <SentenceView
          sentence={analyse.lines[lineIndex]}
          focusWord={focusWord}
          setFocusWord={setFocusWord}
          addDef={def => setDefs({ ...defs, [def.source]: def })}
        />
        <FocusWordPanel
          word={focusWord}
          exportWord={async (cardType, def) => {
            if (!focusWord || !sentence) {
              return
            }

            return exportWordToAnki(cardType, def, focusWord, sentence.join(''))
          }}
          resetFocusWord={() => setFocusWord(undefined)}
          defs={defs}
        />
      </div>
      <Button
        onClick={onNextSentence}
        disabled={lineIndex >= analyse.lines.length - 1}
        overrides={`dark:border-none dark:bg-gray-900 w-32 text-4xl shrink-0`}
      >
        &rarr;
      </Button>
    </div>
  )
}

export default Reader
