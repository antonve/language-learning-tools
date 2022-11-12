import { TextAnalyseLine, TextAnalyseToken } from '@app/chinesetextreader/api'

interface Props {
  sentence: TextAnalyseLine
  focusWord: TextAnalyseToken | undefined
  setFocusWord: (word: TextAnalyseToken | undefined) => void
}

const SentenceView = ({ sentence, focusWord, setFocusWord }: Props) => (
  <p className="text-center text-4xl m-8">
    {sentence.tokens.map((w, i) => (
      <span
        className={`group hover:bg-yellow-100 dark:hover:bg-green-800 cursor-pointer ${
          w.start == focusWord?.start &&
          w.end == focusWord?.end &&
          focusWord.hanzi_traditional == w.hanzi_traditional
            ? 'bg-yellow-100 dark:bg-pink-300 dark:bg-opacity-20'
            : ''
        }`}
        key={i}
        onClick={() => {
          if (focusWord?.start === w.start && focusWord?.end === w.end) {
            setFocusWord(undefined)
          } else {
            setFocusWord(w)
          }
        }}
      >
        {w.hanzi_traditional}
      </span>
    ))}
  </p>
)

export default SentenceView
