import {
  TextAnalyseResponse,
  TextAnalyseToken,
} from '@app/chinesereader/domain'
import SentenceView from '@app/chinesereader/SentenceView'
import { Dispatch, SetStateAction } from 'react'
import { FocusWordWithSentence } from '@app/chinesereader/domain'
import { CedictResult } from '@app/anki/components/zh/api'

interface Props {
  analyse: TextAnalyseResponse | undefined
  focusWord: FocusWordWithSentence | undefined
  setFocusWord: Dispatch<SetStateAction<FocusWordWithSentence | undefined>>
  addDef: (res: CedictResult) => void
}

const Transcript = ({ analyse, focusWord, setFocusWord, addDef }: Props) => {
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
              addDef={addDef}
            />
          </li>
        ))}
      </ul>
    </>
  )
}

export default Transcript
