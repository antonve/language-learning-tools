import {
  TextAnalyseResponse,
  TextAnalyseToken,
} from '@app/chinesetextreader/api'
import SentenceView from '@app/chinesetextreader/SentenceView'
import { Dispatch, SetStateAction } from 'react'
import { FocusWordWithSentence } from '@app/chinesemangareader/domain'

interface Props {
  analyse: TextAnalyseResponse | undefined
  focusWord: FocusWordWithSentence | undefined
  setFocusWord: Dispatch<SetStateAction<FocusWordWithSentence | undefined>>
}

const Transcript = ({ analyse, focusWord, setFocusWord }: Props) => {
  if (!analyse) {
    return <p>Not yet loaded, click title to load.</p>
  }

  return (
    <>
      <ul>
        {analyse.lines.map((l, i) => (
          <li key={`${l.traditional}-${i}`}>
            <SentenceView
              focusWord={focusWord?.word}
              sentence={l}
              setFocusWord={(word: TextAnalyseToken | undefined) => {
                if (!word) {
                  return setFocusWord(undefined)
                }

                setFocusWord({
                  word,
                  sentence: l.traditional,
                })
              }}
            />
          </li>
        ))}
      </ul>
    </>
  )
}

export default Transcript
