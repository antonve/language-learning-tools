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
import { arrayBufferToBase64, Book, getOcr, OcrResult } from '../src/domain'
import { useKeyPress, useWindowSize } from '../src/hooks'
import Transcript from '../src/Transcript'

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

  if (!book) {
    return (
      <div className="w-screen h-screen flex flex-col">
        <BookImporter setBook={setBook} />
      </div>
    )
  }

  return (
    <div className="w-screen h-screen flex">
      <div className="flex-grow h-screen flex flex-col">
        <Page book={book} index={page} ocr={ocr} />
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
        <Transcript ocr={ocr} />
      </div>
    </div>
  )
}

interface Props {
  book: Book
  page: number
  setPage: Dispatch<SetStateAction<number>>
  ocr?: OcrResult | undefined
  fetchOcr?: () => void
}

const BookNavigation = ({ book, page, setPage }: Props) => {
  function onNext() {
    setPage(page + 1)
    console.log('next', page + 1)
  }

  function onPrev() {
    setPage(page - 1)
  }

  useKeyPress('ArrowLeft', onNext)
  useKeyPress('ArrowRight', onPrev)

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

  const containerSize = useWindowSize(containerRef.current)

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

export default Home
