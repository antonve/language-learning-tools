import type { NextPage } from 'next'
import { textAnalyse } from '@app/chinesetextreader/api'
import { useEffect, useState } from 'react'
import { Button } from '@app/chinesemangareader/Components'

interface Props {
  text: string
}

const Reader: NextPage<Props> = ({ text }) => {
  const [analyse, setAnalyse] = useState<undefined | any>()
  const [lineIndex, setLineIndex] = useState<number>(0)

  useEffect(() => {
    textAnalyse(text).then(res => setAnalyse(res))
  }, [text])

  if (!analyse) {
    return <p>Loading...</p>
  }

  return (
    <div>
      <p className="text-center text-4xl m-8">
        {analyse.lines[lineIndex].traditional}
      </p>
      <div className="w-72 mx-auto flex justify-between">
        <Button onClick={() => setLineIndex(lineIndex - 1)}>
          &larr; Previous line
        </Button>
        <Button onClick={() => setLineIndex(lineIndex + 1)}>
          Next line &rarr;
        </Button>
      </div>
    </div>
  )
}

export default Reader
