import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import {
  getTextForBlock,
  OcrResult,
  OcrBlock,
  Sentence,
  CedictResponse,
  fetchCedict,
  CedictEntry,
  Word,
  FocusWord,
} from './domain'

interface Props {
  ocr?: OcrResult | undefined
  focusWord: FocusWord | undefined
  setFocusWord: Dispatch<SetStateAction<FocusWord | undefined>>
}

const Transcript = ({ ocr, focusWord, setFocusWord }: Props) => {
  if (!ocr) {
    return <p>Not yet loaded, click title to load.</p>
  }

  return (
    <>
      <ul>
        {ocr.pages.map(page =>
          page.blocks.map((block, i) => (
            <BlockTranscript
              block={block}
              key={i}
              setFocusWord={setFocusWord}
              focusWord={focusWord}
            />
          )),
        )}
      </ul>
    </>
  )
}

export default Transcript

const BlockTranscript = ({
  block,
  focusWord,
  setFocusWord,
}: {
  block: OcrBlock
  focusWord: FocusWord | undefined
  setFocusWord: Dispatch<SetStateAction<FocusWord | undefined>>
}) => {
  const sentences = getTextForBlock(block)

  const toggleSentence = (word: Word) => {
    setFocusWord({ word, block })
  }

  return (
    <li className="my-4 text-2xl tracking-wide border-b-2 border-opacity-30">
      {sentences.map((s, i) => (
        <SentenceTranscript sentence={s} key={i} toggle={toggleSentence} />
      ))}
    </li>
  )
}

const SentenceTranscript = ({
  sentence,
  toggle,
}: {
  sentence: Sentence
  toggle: (word: Word) => void
}) => {
  const [cedict, setCedict] = useState<CedictResponse>({})

  useEffect(() => {
    fetchCedict(sentence.words).then(res => {
      setCedict(res)
    })
  }, [sentence])

  return (
    <span>
      {sentence.words.map((w, i) => (
        <ruby
          className="hover:bg-yellow-100 cursor-pointer group"
          key={i}
          onClick={() => toggle(w)}
        >
          {w.text} <RubyText cedict={cedict[w.text]} word={w} />
        </ruby>
      ))}
    </span>
  )
}

const RubyText = ({
  cedict,
  word,
}: {
  cedict: CedictEntry | undefined
  word: Word
}) => {
  if (!cedict) {
    return null
  }

  if (word.text.toLowerCase() === cedict.pinyin_tones.toLowerCase()) {
    return null
  }

  if (cedict.pinyin_tones.includes('\uFFFD')) {
    return null
  }

  return (
    <rt className="opacity-0 group-hover:opacity-80 text-xs my-8">
      {cedict.pinyin_tones.toLowerCase()}
    </rt>
  )
}
