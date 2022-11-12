import { CedictResultEntry } from '@app/anki/components/zh/api'
import {
  TextAnalyseResponse,
  TextAnalyseToken,
} from '@app/chinesetextreader/api'
import SentenceView from '@app/chinesetextreader/SentenceView'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { CardType } from './domain'

interface Props {
  analyse: TextAnalyseResponse | undefined
  focusWord: TextAnalyseToken | undefined
  setFocusWord: Dispatch<SetStateAction<TextAnalyseToken | undefined>>
  exportWord: (
    cardType: CardType,
    def: CedictResultEntry,
    focusWord: TextAnalyseToken,
    sentence: string,
  ) => void
}

const Transcript = ({
  analyse,
  focusWord,
  setFocusWord,
  exportWord,
}: Props) => {
  if (!analyse) {
    return <p>Not yet loaded, click title to load.</p>
  }

  return (
    <>
      <ul>
        {analyse.lines.map((l, i) => (
          <li key={`${l.traditional}-${i}`}>
            <SentenceView
              focusWord={focusWord}
              sentence={l}
              setFocusWord={setFocusWord}
              exportWord={exportWord}
            />
          </li>
        ))}
      </ul>
    </>
  )
}

export default Transcript
