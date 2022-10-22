import type { NextPage } from 'next'
import {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import BookImporter from '../src/BookImporter'
import { Button } from '../src/Components'
import {
  arrayBufferToBase64,
  Book,
  getOcr,
  getTextForBlock,
  OcrResult,
  OcrBlock,
  Sentence,
} from '../src/domain'

const Home: NextPage<{}> = () => {
  const [book, setBook] = useState<Book>()
  const [page, setPage] = useState(0)
  const [ocr, setOcr] = useState<OcrResult>()

  useEffect(() => setOcr(undefined), [page])

  const fetchOcr = () => {
    if (!book) {
      return
    }

    getOcr(book.pages[page]).then(res => {
      setOcr(res)
    })
  }

  return (
    <div className="w-screen h-screen flex">
      <div className="flex-grow h-screen flex flex-col">
        {!book ? (
          <BookImporter setBook={setBook} />
        ) : (
          <Page book={book} index={page} ocr={ocr} />
        )}
      </div>
      <div className="w-1/2 flex-shrink-0 p-8 border-l-2 border-gray-200">
        <BookNavigation book={book} page={page} setPage={setPage} />
        <div className="flex flex-row">
          <h2
            className="text-2xl font-bold my-4 cursor-pointer"
            onClick={fetchOcr}
            title="Click to load transcript"
          >
            Transcript
          </h2>
        </div>
        <PageTranscript ocr={ocr} />
      </div>
    </div>
  )
}

interface TranscriptProps {
  ocr?: OcrResult | undefined
}

const PageTranscript = ({ ocr }: TranscriptProps) => {
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

interface Props {
  book: Book | undefined
  page: number
  setPage: Dispatch<SetStateAction<number>>
  ocr?: OcrResult | undefined
  fetchOcr?: () => void
}

const BookNavigation = ({ book, page, setPage }: Props) => {
  if (!book) {
    return null
  }

  function onNext() {
    setPage(page + 1)
    console.log('next', page + 1)
  }

  function onPrev() {
    setPage(page - 1)
  }

  return (
    <div className="flex space-x-10 justify-center items-center">
      <Button onClick={onNext}>next</Button>
      <h1>{book.title}</h1>
      <Button onClick={onPrev}>prev</Button>
    </div>
  )
}

const Page = ({
  book,
  index,
  ocr,
}: {
  book: Book
  index: number
  ocr: OcrResult | undefined
}) => {
  const imageUrl = useMemo(() => {
    return `data:image/jpeg;base64,${arrayBufferToBase64(book.pages[index])}`
  }, [book.pages, index])

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const containerSize = useSize(containerRef.current)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }

    const context = canvas.getContext('2d')
    if (!context) {
      return
    }

    const container = containerRef.current
    if (!container) {
      return
    }
    var img = new Image()
    img.src = imageUrl

    img.onload = function () {
      canvas.width = containerSize.width
      canvas.height = containerSize.height

      console.log(img.width, img.height, canvas.width, canvas.height)

      let scale = Math.min(canvas.width / img.width, canvas.height / img.height)
      let width = img.width * scale
      let height = img.height * scale
      let x = canvas.width / 2 - width / 2
      let y = canvas.height / 2 - height / 2

      context.drawImage(img, x, y, width, height)

      if (!ocr) {
        return
      }

      for (const page of ocr.pages) {
        for (const block of page.blocks) {
          const { vertices } = block.bounding_box
          context.beginPath()
          context.moveTo(x + vertices[0].x * scale, y + vertices[0].y * scale)
          context.lineTo(x + vertices[1].x * scale, y + vertices[1].y * scale)
          context.lineTo(x + vertices[2].x * scale, y + vertices[2].y * scale)
          context.lineTo(x + vertices[3].x * scale, y + vertices[3].y * scale)
          context.closePath()
          context.strokeStyle = 'rgba(173, 216, 230, 0.5)'
          context.lineWidth = 2
          context.stroke()
        }
      }
    }

    return () => {
      context.clearRect(0, 0, canvas.width, canvas.height)
    }
  }, [canvasRef, containerRef, imageUrl, containerSize, ocr])

  return (
    <div ref={containerRef} className="flex-grow relative">
      <canvas ref={canvasRef} className="w-full h-full absolute" />
    </div>
  )
}

function useSize(ref: HTMLDivElement | null) {
  const [size, setSize] = useState({
    width: 0,
    height: 0,
  })

  useEffect(() => {
    if (!ref) {
      return
    }

    function handleResize() {
      console.log('hook', ref?.offsetWidth, ref?.offsetHeight)
      setSize({
        width: ref?.offsetWidth ?? 0,
        height: ref?.offsetHeight ?? 0,
      })
    }

    window.addEventListener('resize', handleResize)
    handleResize()

    return () => window.removeEventListener('resize', handleResize)
  }, [ref])

  return size
}

export default Home
