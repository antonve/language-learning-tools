import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { Button } from './Components'
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
  CardType,
} from './domain'

interface Props {
  ocr?: OcrResult | undefined
  focusWord: FocusWord | undefined
  setFocusWord: Dispatch<SetStateAction<FocusWord | undefined>>
  exportWord: (cardType: CardType) => Promise<void>
}

const Transcript = ({ ocr, focusWord, setFocusWord, exportWord }: Props) => {
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
              exportWord={exportWord}
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
  exportWord,
}: {
  block: OcrBlock
  focusWord: FocusWord | undefined
  setFocusWord: Dispatch<SetStateAction<FocusWord | undefined>>
  exportWord: (cardType: CardType) => Promise<void>
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
      <FocusWordPanel word={focusWord} block={block} exportWord={exportWord} />
    </>
  )
}

const FocusWordPanel = ({
  word,
  block,
  exportWord,
}: {
  word: FocusWord | undefined
  block: OcrBlock
  exportWord: (cardType: CardType) => Promise<void>
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
      <div className="flex">
        <ol className="list-decimal pl-5 flex-grow">
          {word.cedict.meanings.map((m, i) => (
            <li key={i}>{m}</li>
          ))}
        </ol>
        <div>
          <Button onClick={() => exportWord('sentence')}>
            Export sentence
          </Button>
          <Button onClick={() => exportWord('vocab')}>Export vocab</Button>
        </div>
      </div>
    </li>
  )
}

const Reading = ({ entry }: { entry: CedictEntry }) => {
  const pairs = getReadingPairs(entry)

  return (
    <span>
      {pairs.map((p, i) => (
        <span key={i} className={toneToColor(p.tone)}>
          {p.reading}
        </span>
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
          className={`group ${
            w.id == focusWord?.word.id ? 'bg-yellow-100' : ''
          } ${w.text in cedict ? 'hover:bg-yellow-100 cursor-pointer' : ''}`}
          key={i}
          onClick={() => {
            if (w.text in cedict) {
              toggle(w, cedict[w.text])
            }
          }}
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
