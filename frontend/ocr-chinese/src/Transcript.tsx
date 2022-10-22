import { useEffect, useState } from 'react'
import {
  getTextForBlock,
  OcrResult,
  OcrBlock,
  Sentence,
  CedictResponse,
  fetchCedict,
  CedictEntry,
  Word,
} from './domain'

interface Props {
  ocr?: OcrResult | undefined
}

const Transcript = ({ ocr }: Props) => {
  if (!ocr) {
    return <p>Not yet loaded, click title to load.</p>
  }

  return (
    <>
      <ul>
        {ocr.pages.map(page =>
          page.blocks.map((block, i) => (
            <BlockTranscript block={block} key={i} />
          )),
        )}
      </ul>
    </>
  )
}

export default Transcript

const BlockTranscript = ({ block }: { block: OcrBlock }) => {
  const sentences = getTextForBlock(block)

  return (
    <li className="my-4 text-2xl tracking-wide">
      {sentences.map((s, i) => (
        <SentenceTranscript sentence={s} key={i} />
      ))}
    </li>
  )
}

const SentenceTranscript = ({ sentence }: { sentence: Sentence }) => {
  const [cedict, setCedict] = useState<CedictResponse>({})

  useEffect(() => {
    fetchCedict(sentence.words).then(res => {
      setCedict(res)
    })
  }, [sentence])

  return (
    <span>
      {sentence.words.map((w, i) => (
        <ruby className="hover:bg-yellow-100" key={i}>
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

  return <rt>{cedict.pinyin_tones.toLowerCase()}</rt>
}
