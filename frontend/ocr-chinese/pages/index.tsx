import type { NextPage } from 'next'
import { useEffect, useMemo, useState } from 'react'
import BookImporter from '../src/BookImporter'
import { arrayBufferToBase64, Book, getOcr, getOCR } from '../src/domain'

const Home: NextPage<{}> = () => {
  const [book, setBook] = useState<Book>()

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden">
      <div className="w-full flex h-full flex-grow">
        <div className="flex-grow h-full flex flex-col">
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
      <Page book={book} index={page} />
    </>
  )
}

const Page = ({ book, index }: { book: Book; index: number }) => {
  const imageUrl = useMemo(() => {
    return `data:image/jpeg;base64,${arrayBufferToBase64(book.pages[index])}`
  }, [index])

  return (
    <div className="flex-grow flex justify-center items-center h-48">
      <img
        src={imageUrl}
        className="max-h-full max-w-full block m-8"
        draggable={false}
      />
    </div>
  )
}

export default Home
