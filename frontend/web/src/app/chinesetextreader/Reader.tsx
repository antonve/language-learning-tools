import type { NextPage } from 'next'
import { textAnalyse } from '@app/chinesetextreader/api'
import { useEffect, useState } from 'react'
import { Button } from '@app/chinesemangareader/Components'
import SentenceView from './SentenceView'
import { useKeyPress } from '@app/chinesemangareader/hooks'

interface Props {
  text: string
}

const Reader: NextPage<Props> = ({ text }) => {
  const [analyse, setAnalyse] = useState<undefined | any>()
  const [lineIndex, setLineIndex] = useState<number>(0)

  const onNextSentence = () => {
    if (lineIndex < analyse.lines.length - 1) {
      setLineIndex(lineIndex + 1)
    }
  }
  const onPrevSentence = () => {
    if (lineIndex >= 1) {
      setLineIndex(lineIndex - 1)
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
      <SentenceView sentence={analyse.lines[lineIndex]} />
    </div>
  )
}

export default Reader
