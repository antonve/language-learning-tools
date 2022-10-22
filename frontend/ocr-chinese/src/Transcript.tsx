import { useEffect, useState } from 'react'
import {
  getTextForBlock,
  OcrResult,
  OcrBlock,
  Sentence,
  CedictResponse,
  fetchCedict,
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
  const [cedict, setCedict] = useState<CedictResponse>()

  useEffect(() => {
    fetchCedict(sentence.words).then(res => {
      console.log(res)
      setCedict(res)
    })
  }, [sentence])

  return (
    <span>
      {sentence.words.map((s, i) => (
        <span className="hover:bg-yellow-100" key={i}>
          {s.text}
        </span>
      ))}
    </span>
  )
}
