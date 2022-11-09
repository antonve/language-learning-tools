import { Dispatch, SetStateAction } from 'react'
import {
  TextAnalyseDictionaryEntry,
  TextAnalyseLine,
  TextAnalyseToken,
} from '@app/chinesetextreader/api'
import {
  CardType,
  getReadingPairs,
  toneToColor,
} from '@app/chinesemangareader/domain'
import { Button, ButtonLink } from '@app/chinesemangareader/Components'

interface Props {
  sentence: TextAnalyseLine
  focusWord: TextAnalyseToken | undefined
  setFocusWord: Dispatch<SetStateAction<TextAnalyseToken | undefined>>
}

const SentenceView = ({ sentence, focusWord, setFocusWord }: Props) => (
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
    />
    <FocusWordPanel
      word={focusWord}
      exportWord={async (cardType: CardType) => {}}
      setFocusWord={setFocusWord}
    />
  </div>
)

export default SentenceView

const FocusWordPanel = ({
  word,
  exportWord,
  setFocusWord,
}: {
  word: TextAnalyseToken | undefined
  exportWord: (cardType: CardType) => Promise<void>
  setFocusWord: Dispatch<SetStateAction<TextAnalyseToken | undefined>>
}) => {
  if (!word) {
    return null
  }

  if (!word.dictionary_entries) {
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

      <div className="divide-y-2 divide-yellow-400 divide-opacity-30 space-y-5">
        {word.dictionary_entries.map(d => (
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
    </div>
  )
}

const Reading = ({ entry }: { entry: TextAnalyseDictionaryEntry }) => {
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
}: {
  sentence: TextAnalyseLine
  toggle: (word: TextAnalyseToken) => void
  focusWord: TextAnalyseToken | undefined
}) => (
  <p className="text-center text-4xl m-8">
    {sentence.tokens.map((w, i) => (
      <ruby
        className={`group ${
          w.start == focusWord?.start && w.end == focusWord?.end
            ? 'bg-yellow-100 dark:bg-pink-300 dark:bg-opacity-20'
            : ''
        } ${
          !!w.dictionary_entries
            ? 'hover:bg-yellow-100 dark:hover:bg-green-800 cursor-pointer'
            : ''
        }`}
        key={i}
        onClick={() => {
          if (w.dictionary_entries) {
            toggle(w)
          }
        }}
      >
        {w.hanzi_traditional} <RubyText word={w} />
      </ruby>
    ))}
  </p>
)

const RubyText = ({ word }: { word: TextAnalyseToken }) => {
  if (word.dictionary_entries.length == 0) {
    return null
  }

  if (
    word.hanzi_traditional.toLowerCase() ===
    word.dictionary_entries[0].pinyin_tones.toLowerCase()
  ) {
    return null
  }

  if (word.dictionary_entries[0].pinyin_tones.includes('\uFFFD')) {
    return null
  }

  return (
    <rt className="opacity-0 group-hover:opacity-80 text-xs my-8">
      {word.dictionary_entries[0].pinyin_tones.toLowerCase()}
    </rt>
  )
}
