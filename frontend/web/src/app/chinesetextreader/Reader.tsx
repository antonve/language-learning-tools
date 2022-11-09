import type { NextPage } from 'next'
import { textAnalyse, TextAnalyseToken } from '@app/chinesetextreader/api'
import { useEffect, useState } from 'react'
import Button from '@app/anki/components/Button'
import SentenceView from './SentenceView'
import { useKeyPress } from '@app/chinesemangareader/hooks'

interface Props {
  text: string
}

const Reader: NextPage<Props> = ({ text }) => {
  const [analyse, setAnalyse] = useState<undefined | any>()
  const [lineIndex, setLineIndex] = useState<number>(0)
  const [focusWord, setFocusWord] = useState<TextAnalyseToken | undefined>()

  const onNextSentence = () => {
    if (lineIndex < analyse.lines.length - 1) {
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
    <div>
      <div className="w-72 mx-auto flex justify-between">
        <Button onClick={onPrevSentence} disabled={lineIndex <= 0}>
          &larr; Previous line
        </Button>
        <Button
          onClick={onNextSentence}
          disabled={lineIndex >= analyse.lines.length - 1}
        >
          Next line &rarr;
        </Button>
      </div>
      <SentenceView
        sentence={analyse.lines[lineIndex]}
        focusWord={focusWord}
        setFocusWord={setFocusWord}
      />
    </div>
  )
}

export default Reader
