import type { NextPage } from 'next'
import { useEffect, useMemo, useRef, useState } from 'react'
import BookImporter from '../src/BookImporter'
import { arrayBufferToBase64, Book, getOcr, getOCR } from '../src/domain'

const Home: NextPage<{}> = () => {
  const [book, setBook] = useState<Book>()

  return (
    <div className="w-screen h-screen flex">
      <div className="flex-grow h-screen flex flex-col">
        <Reader book={book} setBook={setBook} />
      </div>
      <div className="bg-pink-400 w-1/5 flex-shrink-0">sidebar</div>
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
    console.log('next', page + 1)
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
    }

    return () => {
      context.clearRect(0, 0, canvas.width, canvas.height)
    }
  }, [canvasRef, containerRef, imageUrl, containerSize])

  return (
    <div ref={containerRef} className="flex-grow bg-red-200 relative">
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
