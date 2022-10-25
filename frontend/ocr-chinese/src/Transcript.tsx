import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { Button, ButtonLink } from './Components'
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
  getWordsFromOcrResult,
  getRawTextForBlock,
} from './domain'

interface Props {
  ocr?: OcrResult | undefined
  focusWord: FocusWord | undefined
  setFocusWord: Dispatch<SetStateAction<FocusWord | undefined>>
  exportWord: (cardType: CardType) => Promise<void>
}

const Transcript = ({ ocr, focusWord, setFocusWord, exportWord }: Props) => {
  const [cedict, setCedict] = useState<CedictResponse>({})

  useEffect(() => {
    if (ocr) {
      fetchCedict(getWordsFromOcrResult(ocr)).then(res => {
        setCedict(res)
      })
    }
  }, [ocr])

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
              cedict={cedict}
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
  cedict,
}: {
  block: OcrBlock
  focusWord: FocusWord | undefined
  setFocusWord: Dispatch<SetStateAction<FocusWord | undefined>>
  exportWord: (cardType: CardType) => Promise<void>
  cedict: CedictResponse
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
      <li className="my-2 text-2xl tracking-wide">
        {sentences.map((s, i) => (
          <SentenceTranscript
            sentence={s}
            key={i}
            toggle={toggleSentence}
            focusWord={focusWord}
            cedict={cedict}
          />
        ))}
      </li>
      <FocusWordPanel
        word={focusWord}
        block={block}
        exportWord={exportWord}
        setFocusWord={setFocusWord}
      />
    </>
  )
}

const FocusWordPanel = ({
  word,
  block,
  exportWord,
  setFocusWord,
}: {
  word: FocusWord | undefined
  block: OcrBlock
  exportWord: (cardType: CardType) => Promise<void>
  setFocusWord: Dispatch<SetStateAction<FocusWord | undefined>>
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
      <ol className="list-decimal pl-5 flex-grow">
        {word.cedict.meanings.map((m, i) => (
          <li key={i}>{m}</li>
        ))}
      </ol>
      <div className="flex">
        <div className="flex flex-row space-x-4 mt-4">
          <Button
            onClick={() =>
              exportWord('sentence')
                .then(() => setFocusWord(undefined))
                .catch(reason =>
                  window.alert('could not export word: ' + reason),
                )
            }
            className="bg-green-100 text-green-500 hover:bg-green-200 hover:text-green-500"
          >
            Export sentence
          </Button>
          <Button
            onClick={() =>
              exportWord('vocab')
                .then(() => setFocusWord(undefined))
                .catch(reason =>
                  window.alert('could not export word: ' + reason),
                )
            }
            className="bg-blue-100 text-blue-500 hover:bg-blue-200 hover:text-blue-500"
          >
            Export vocab
          </Button>
          <ButtonLink
            href={`https://www.mdbg.net/chinese/dictionary?page=worddict&wdrst=1&wdqb=${getRawTextForBlock(
              word.block,
            )}`}
            target="_blank"
            className="bg-violet-100 text-violet-500 hover:bg-violet-200 hover:text-violet-500"
          >
            Dictionary
          </ButtonLink>
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
  cedict,
}: {
  sentence: Sentence
  toggle: (word: Word, cedict: CedictEntry) => void
  focusWord: FocusWord | undefined
  cedict: CedictResponse
}) => (
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
