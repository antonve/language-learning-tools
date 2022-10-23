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
  getReadingPairs,
  toneToColor,
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

  const toggleSentence = (word: Word, cedict: CedictEntry) => {
    if (word.text == focusWord?.word.text) {
      setFocusWord(undefined)
    } else {
      setFocusWord({ word, block, cedict })
    }
  }

  return (
    <>
      <li className="my-4 text-2xl tracking-wide border-b-2 border-opacity-30">
        {sentences.map((s, i) => (
          <SentenceTranscript
            sentence={s}
            key={i}
            toggle={toggleSentence}
            focusWord={focusWord}
          />
        ))}
      </li>
      <FocusWordPanel word={focusWord} block={block} />
    </>
  )
}

const FocusWordPanel = ({
  word,
  block,
}: {
  word: FocusWord | undefined
  block: OcrBlock
}) => {
  if (!word || block != word.block) {
    return null
  }

  if (!word.cedict) {
    return (
      <li className="border-2 border-opacity-30 border-yellow-400 p-4">
        No dictionary results
      </li>
    )
  }

  return (
    <li className="border-2 border-opacity-30 border-yellow-400 bg-yellow-50 p-4">
      <div className="flex space-between text-4xl mb-4 justify-between">
        <h2>{word.word.text}</h2>
        <Reading entry={word.cedict} />
        {word.cedict.hanzi_simplified != word.word.text ? (
          <span title="simplified">{word.cedict.hanzi_simplified}</span>
        ) : null}
      </div>
      <ol className="list-decimal pl-5">
        {word.cedict.meanings.map(m => (
          <li>{m}</li>
        ))}
      </ol>
    </li>
  )
}

const Reading = ({ entry }: { entry: CedictEntry }) => {
  const pairs = getReadingPairs(entry)

  return (
    <span>
      {pairs.map(p => (
        <span className={toneToColor(p.tone)}>{p.reading}</span>
      ))}
    </span>
  )
}

const SentenceTranscript = ({
  sentence,
  toggle,
  focusWord,
}: {
  sentence: Sentence
  toggle: (word: Word, cedict: CedictEntry) => void
  focusWord: FocusWord | undefined
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
          className={`hover:bg-yellow-100 cursor-pointer group ${
            w.id == focusWord?.word.id ? 'bg-yellow-100' : ''
          }`}
          key={i}
          onClick={() => toggle(w, cedict[w.text])}
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
