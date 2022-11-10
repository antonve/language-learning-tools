import {
  CedictResult,
  CedictResultCollection,
  CedictResultEntry,
  getCedictDefinitions,
} from '@app/anki/components/zh/api'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { Button, ButtonLink } from './Components'
import {
  getTextForBlock,
  OcrResult,
  OcrBlock,
  Sentence,
  Word,
  FocusWord,
  getReadingPairs,
  toneToColor,
  CardType,
  getWordsFromOcrResult,
} from './domain'

interface Props {
  ocr?: OcrResult | undefined
  focusWord: FocusWord | undefined
  setFocusWord: Dispatch<SetStateAction<FocusWord | undefined>>
  exportWord: (cardType: CardType) => Promise<void>
}

const Transcript = ({ ocr, focusWord, setFocusWord, exportWord }: Props) => {
  const [cedict, setCedict] = useState<CedictResultCollection>({})

  useEffect(() => {
    if (ocr) {
      getCedictDefinitions(getWordsFromOcrResult(ocr).map(o => o.text)).then(
        res => {
          setCedict(res)
        },
      )
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
  cedict: CedictResultCollection
}) => {
  const sentences = getTextForBlock(block)

  const toggleSentence = (word: Word, cedict: CedictResult) => {
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

  const dict = word.cedict

  return (
    <li className="border-2 border-opacity-30 border-yellow-400 bg-yellow-50 p-4">
      <div className="flex space-between text-4xl mb-4 justify-between">
        <h2>{word.word.text}</h2>
        <ButtonLink
          href={`https://www.mdbg.net/chinese/dictionary?page=worddict&wdrst=1&wdqb=${word.word.text}`}
          target="_blank"
          className="bg-violet-100 text-violet-500 hover:bg-violet-200 hover:text-violet-50 dark:bg-violet-900 dark:text-violet-300 dark:hover:bg-violet-700 dark:hover:text-violet-100"
        >
          Dictionary
        </ButtonLink>
      </div>

      <div className="divide-y-2 divide-yellow-400 divide-opacity-30 space-y-5 dark:divide-gray-800">
        {dict.results.map(d => (
          <div className="flex pt-5" key={JSON.stringify(d)}>
            <Reading entry={d} />
            <ol className="list-decimal pl-5 flex-grow">
              {d.meanings.map((m, i) => (
                <li key={i}>{m}</li>
              ))}
            </ol>

            <div className="flex flex-row space-x-4">
              <Button
                onClick={() =>
                  exportWord('sentence')
                    .then(() => setFocusWord(undefined))
                    .catch(reason =>
                      window.alert('could not export word: ' + reason),
                    )
                }
                className="bg-green-100 text-green-500 hover:bg-green-200 hover:text-green-500 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-700 dark:hover:text-green-100"
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
                className="bg-blue-100 text-blue-500 hover:bg-blue-200 hover:text-blue-500 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-700 dark:hover:text-blue-100"
              >
                Export vocab
              </Button>
            </div>
          </div>
        ))}
      </div>
    </li>
  )
}

const Reading = ({ entry }: { entry: CedictResultEntry }) => {
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
  toggle: (word: Word, cedict: CedictResult) => void
  focusWord: FocusWord | undefined
  cedict: CedictResultCollection
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
  cedict: CedictResult | undefined
  word: Word
}) => {
  if (!cedict || cedict.results.length == 0) {
    return null
  }

  // if (
  //   word.hanzi_traditional.toLowerCase() ===
  //   word.dictionary_entries[0].pinyin_tones.toLowerCase()
  // ) {
  //   return null
  // }

  // if (word.dictionary_entries[0].pinyin_tones.includes('\uFFFD')) {
  //   return null
  // }

  return (
    <rt className="opacity-0 group-hover:opacity-80 text-xs my-8">
      {cedict.results[0].pinyin_tones.toLowerCase()}
    </rt>
  )
}
