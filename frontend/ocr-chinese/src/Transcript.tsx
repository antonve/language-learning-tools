import { getTextForBlock, OcrResult, OcrBlock, Sentence } from './domain'

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
          page.blocks.map(block => <BlockTranscript block={block} />),
        )}
      </ul>
    </>
  )
}

export default Transcript

const BlockTranscript = ({ block }: { block: OcrBlock }) => {
  const sentences = getTextForBlock(block)

  return (
    <li className="bg-green-200 my-4">
      {sentences.map(s => (
        <SentenceTranscript sentence={s} />
      ))}
    </li>
  )
}

const SentenceTranscript = ({ sentence }: { sentence: Sentence }) => {
  return (
    <span>
      {sentence.words.map(s => (
        <span className="hover:bg-red-200">{s.text}</span>
      ))}
    </span>
  )
}
