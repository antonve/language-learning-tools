import type { NextPage } from 'next'
import { useEffect, useMemo, useRef, useState } from 'react'
import BookImporter from '../src/BookImporter'
import { arrayBufferToBase64, Book, getOcr, getOCR } from '../src/domain'

const Home: NextPage<{}> = () => {
  const [book, setBook] = useState<Book>()

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden">
      <div className="w-full flex h-full flex-grow">
        <div className="flex-grow h-screen flex flex-col">
          <Reader book={book} setBook={setBook} />
        </div>
        <div className="bg-pink-400 w-1/5 flex-shrink-0">sidebar</div>
      </div>
    </div>
  )
}

interface Props {
  book: Book | undefined
  setBook: (file: Book | undefined) => void
}

const Reader = ({ book, setBook }: Props) => {
  const [page, setPage] = useState(0)
  const [ocr, setOcr] = useState()

  useEffect(() => {
    if (!book) {
      return
    }

    getOcr(book.pages[page]).then(res => {
      setOcr(res)
    })
  }, [book, page])

  function onNext() {
    setPage(page + 1)
  }

  function onPrev() {
    setPage(page - 1)
  }

  if (!book) {
    return <BookImporter setBook={setBook} />
  }

  return (
    <>
      <div className="flex space-x-10 justify-center items-center">
        <button
          onClick={onNext}
          className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4"
        >
          next
        </button>
        <h1>{book.title}</h1>
        <button
          onClick={onPrev}
          className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4"
        >
          prev
        </button>
      </div>
      <Page book={book} index={page} ocr={ocr} />
    </>
  )
}

const Page = ({
  book,
  index,
  ocr,
}: {
  book: Book
  index: number
  ocr: any
}) => {
  const imageUrl = useMemo(() => {
    return `data:image/jpeg;base64,${arrayBufferToBase64(book.pages[index])}`
  }, [index])

  return (
    <div className="flex-grow bg-red-200 p-4">
      <div className="max-w-full w-auto h-full bg-green-300 relative">
        <div className="absolute bg-indigo-300 top-0 bottom-0 left-1/2 transform -translate-x-1/2">
          <img
            src={imageUrl}
            className="h-full w-full block"
            draggable={false}
          />
        </div>
      </div>
    </div>
  )
}

const Canvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }

    const context = canvas.getContext('2d')
    if (!context) {
      return
    }
    //Our first draw
    context.fillStyle = '#000000'
    context.fillRect(0, 0, context.canvas.width, context.canvas.height)

    return () => {
      context.clearRect(0, 0, canvas.width, canvas.height)
    }
  }, [canvasRef])

  return (
    <canvas
      ref={canvasRef}
      className="absolute left-0 right-0 top-0 bottom-0"
    />
  )
}

export default Home
