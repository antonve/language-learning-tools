import type { NextPage } from 'next'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import BookImporter from '../src/BookImporter'
import BookPage from '../src/BookPage'
import { Button } from '../src/Components'
import { Book, getOcr, OcrResult } from '../src/domain'
import { useKeyPress } from '../src/hooks'
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
        <BookPage book={book} index={page} ocr={ocr} />
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

export default Home
