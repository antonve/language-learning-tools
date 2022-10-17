import type { NextPage } from 'next'
import { useMemo, useState } from 'react'
import BookImporter from '../src/BookImporter'
import { arrayBufferToBase64, Book } from '../src/domain'

const Home: NextPage<{}> = () => {
  const [book, setBook] = useState<Book>()

  return (
    <div className="bg-gray-900 h-screen w-screen flex flex-col overflow-hidden">
      <header
        className={`border-t-4 border-pink-400 p-4 justify-between box-border`}
      >
        <h1 className="text-gray-100 text-base no-underline hover:no-underline font-extrabold text-xl">
          Chinese OCR
        </h1>
      </header>
      <div className="flex bg-white flex-grow ">
        <div className="w-full flex h-full flex-grow">
          <div className="flex-grow h-full flex flex-col">
            <Reader book={book} setBook={setBook} />
          </div>
          <div className="bg-pink-400 w-1/5 flex-shrink-0">sidebar</div>
        </div>
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
      <div className="space-x-10">
        <button onClick={onNext}>Next</button>
        <button onClick={onPrev}>Prev</button>
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
      <img src={imageUrl} className="max-h-full max-w-full block m-8" />
    </div>
  )
}

export default Home
