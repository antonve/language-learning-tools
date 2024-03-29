import {
  CedictResult,
  getCedictDefinitions,
} from 'src/lib/anki/components/zh/api'
import { TextAnalyseLine, TextAnalyseToken } from 'src/lib/chinesereader/domain'
import { useEffect } from 'react'
import { useTextSelection } from './hooks'

interface Props {
  sentence: TextAnalyseLine
  focusWord: TextAnalyseToken | undefined
  setFocusWord: (word: TextAnalyseToken | undefined) => void
  addDef: (res: CedictResult) => void
}

const SentenceView = ({ sentence, focusWord, setFocusWord, addDef }: Props) => {
  const { range, ref } = useTextSelection()

  useEffect(() => {
    const action = async () => {
      const selectedText = range?.toString()

      if (!selectedText) {
        return
      }

      const def = await getCedictDefinitions([selectedText])

      if (!def[selectedText]) {
        return
      }

      addDef(def[selectedText])
      setFocusWord({
        hanzi_traditional: selectedText,
        hanzi_simplified: selectedText,
        start: 0,
        end: 0,
      })
    }
    action()
  }, [range])

  return (
    <p className="text-center text-4xl m-8 md:m-0">
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
}

export default SentenceView
