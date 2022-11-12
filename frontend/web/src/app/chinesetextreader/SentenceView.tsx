import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { TextAnalyseLine, TextAnalyseToken } from '@app/chinesetextreader/api'
import {
  CardType,
  createPendingCard,
  getReadingPairs,
  toneToColor,
} from '@app/chinesemangareader/domain'
import { Button, ButtonLink } from '@app/chinesemangareader/Components'
import {
  CedictResult,
  CedictResultCollection,
  CedictResultEntry,
  getCedictDefinitions,
} from '@app/anki/components/zh/api'

interface Props {
  sentence: TextAnalyseLine
  focusWord: TextAnalyseToken | undefined
  setFocusWord: Dispatch<SetStateAction<TextAnalyseToken | undefined>>
}

const SentenceView = ({ sentence, focusWord, setFocusWord }: Props) => {
  const [defs, setDefs] = useState<CedictResultCollection>({})

  useEffect(() => {
    getCedictDefinitions(sentence.tokens.map(t => t.hanzi_traditional)).then(
      res => setDefs(res),
    )
  }, [sentence])

  // TODO: merge text and manga reader domain logic
  const exportWord = (cardType: CardType, def: CedictResultEntry) => {
    if (!focusWord) {
      return Promise.reject()
    }

    return createPendingCard({
      id: undefined,
      language_code: 'zho',
      token: focusWord.hanzi_traditional,
      source_image: undefined,
      meta: {
        sentence: sentence.tokens.map(t => t.hanzi_traditional).join(''),
        card_type: cardType,
        hanzi_traditional: focusWord.hanzi_traditional,
        hanzi_simplified: focusWord.hanzi_simplified,
        pinyin: def.pinyin.toLowerCase(),
        pinyin_tones: def.pinyin_tones.toLowerCase(),
        meanings: def.meanings ?? [],
      },
    })
  }

  return (
    <div>
      <SentenceTranscript
        focusWord={focusWord}
        sentence={sentence}
        toggle={(word: TextAnalyseToken) => {
          if (focusWord?.start === word.start && focusWord?.end === word.end) {
            setFocusWord(undefined)
          } else {
            setFocusWord(word)
          }
        }}
        defs={defs}
      />
      <FocusWordPanel
        word={focusWord}
        exportWord={exportWord}
        setFocusWord={setFocusWord}
        defs={defs}
      />
    </div>
  )
}

export default SentenceView

const FocusWordPanel = ({
  word,
  exportWord,
  setFocusWord,
  defs,
}: {
  word: TextAnalyseToken | undefined
  exportWord: (cardType: CardType, def: CedictResultEntry) => Promise<void>
  setFocusWord: Dispatch<SetStateAction<TextAnalyseToken | undefined>>
  defs: CedictResultCollection
}) => {
  if (!word) {
    return null
  }

  const dict = defs[word.hanzi_traditional]

  if (!dict) {
    return (
      <div className="border-2 border-opacity-30 border-yellow-400 p-4">
        No dictionary results
      </div>
    )
  }

  return (
    <div className="border-2 border-opacity-30 border-yellow-400 bg-yellow-50 p-4 dark:bg-gray-900 dark:border-gray-900">
      <div className="flex space-between mb-4 justify-between">
        <h2 className="text-4xl">{word.hanzi_traditional}</h2>
        {word.hanzi_simplified != word.hanzi_traditional ? (
          <span title="simplified" className="text-4xl">
            {word.hanzi_simplified}
          </span>
        ) : null}

        <ButtonLink
          href={`https://www.mdbg.net/chinese/dictionary?page=worddict&wdrst=1&wdqb=${word.hanzi_traditional}`}
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
                  exportWord('sentence', d)
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
                  exportWord('vocab', d)
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
    </div>
  )
}

const Reading = ({ entry }: { entry: CedictResultEntry }) => {
  const pairs = getReadingPairs(entry)

  return (
    <span className="text-4xl min-w-48 pr-10">
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
  defs,
}: {
  sentence: TextAnalyseLine
  toggle: (word: TextAnalyseToken) => void
  focusWord: TextAnalyseToken | undefined
  defs: CedictResultCollection
}) => (
  <p className="text-center text-4xl m-8">
    {sentence.tokens.map((w, i) => (
      <ruby
        className={`group ${
          w.start == focusWord?.start && w.end == focusWord?.end
            ? 'bg-yellow-100 dark:bg-pink-300 dark:bg-opacity-20'
            : ''
        } ${
          defs[w.hanzi_traditional] &&
          defs[w.hanzi_traditional].results.length >= 1
            ? 'hover:bg-yellow-100 dark:hover:bg-green-800 cursor-pointer'
            : ''
        }`}
        key={i}
        onClick={() => {
          if (
            defs[w.hanzi_traditional] &&
            defs[w.hanzi_traditional].results.length >= 1
          ) {
            toggle(w)
          }
        }}
      >
        {w.hanzi_traditional}{' '}
        <RubyText word={w} def={defs[w.hanzi_traditional]} />
      </ruby>
    ))}
  </p>
)

const RubyText = ({
  word,
  def,
}: {
  word: TextAnalyseToken
  def: CedictResult | undefined
}) => {
  if (!def || def.results.length == 0) {
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
      {def.results[0].pinyin_tones.toLowerCase()}
    </rt>
  )
}
