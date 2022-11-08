import { Dispatch, SetStateAction, useState } from 'react'
import { TextAnalyseLine, TextAnalyseToken } from '@app/chinesetextreader/api'
import {
  CardType,
  getReadingPairs,
  toneToColor,
} from '@app/chinesemangareader/domain'
import { Button, ButtonLink } from '@app/chinesemangareader/Components'

interface Props {
  sentence: TextAnalyseLine
}

const SentenceView = ({ sentence }: Props) => {
  const [focusWord, setFocusWord] = useState<TextAnalyseToken | undefined>()

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
      />
      <FocusWordPanel
        word={focusWord}
        exportWord={async (cardType: CardType) => {}}
        setFocusWord={setFocusWord}
      />
    </div>
  )
}

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

  if (!word.dictionary_entry) {
    return (
      <div className="border-2 border-opacity-30 border-yellow-400 p-4">
        No dictionary results
      </div>
    )
  }

  return (
    <div className="border-2 border-opacity-30 border-yellow-400 bg-yellow-50 p-4">
      <div className="flex space-between text-4xl mb-4 justify-between">
        <h2>{word.hanzi_traditional}</h2>
        <Reading entry={word.dictionary_entry} />
        {word.hanzi_simplified != word.hanzi_traditional ? (
          <span title="simplified">{word.hanzi_simplified}</span>
        ) : null}
      </div>
      <ol className="list-decimal pl-5 flex-grow">
        {word.dictionary_entry.meanings.map((m, i) => (
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
            href={`https://www.mdbg.net/chinese/dictionary?page=worddict&wdrst=1&wdqb=${word.hanzi_traditional}`}
            target="_blank"
            className="bg-violet-100 text-violet-500 hover:bg-violet-200 hover:text-violet-500"
          >
            Dictionary
          </ButtonLink>
        </div>
      </div>
    </div>
  )
}

const Reading = ({
  entry,
}: {
  entry: TextAnalyseToken['dictionary_entry']
}) => {
  if (!entry) {
    return null
  }

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
  sentence: TextAnalyseLine
  toggle: (word: TextAnalyseToken) => void
  focusWord: TextAnalyseToken | undefined
}) => (
  <p className="text-center text-4xl m-8">
    {sentence.tokens.map((w, i) => (
      <ruby
        className={`group ${
          w.start == focusWord?.start && w.end == focusWord?.end
            ? 'bg-yellow-100'
            : ''
        } ${!!w.dictionary_entry ? 'hover:bg-yellow-100 cursor-pointer' : ''}`}
        key={i}
        onClick={() => {
          if (w.dictionary_entry) {
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
  if (!word.dictionary_entry) {
    return null
  }

  if (
    word.hanzi_traditional.toLowerCase() ===
    word.dictionary_entry.pinyin_tones.toLowerCase()
  ) {
    return null
  }

  if (word.dictionary_entry.pinyin_tones.includes('\uFFFD')) {
    return null
  }

  return (
    <rt className="opacity-0 group-hover:opacity-80 text-xs my-8">
      {word.dictionary_entry.pinyin_tones.toLowerCase()}
    </rt>
  )
}
