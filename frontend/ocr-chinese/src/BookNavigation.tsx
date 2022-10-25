import { Dispatch, SetStateAction } from 'react'
import { Button } from './Components'
import { Book, OcrResult } from './domain'
import { useKeyPress } from './hooks'

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
  }

  function onPrev() {
    setPage(page - 1)
  }

  useKeyPress('ArrowLeft', onNext)
  useKeyPress('ArrowRight', onPrev)

  return (
    <div className="flex space-x-10 justify-center items-center">
      <Button onClick={onNext} disabled={book.pages.length - 1 <= page}>
        next
      </Button>
      <h1
        onClick={() => {
          const p =
            parseInt(
              window.prompt(`Skip to page (max ${book.pages.length})`) ?? '0',
            ) - 1
          if (p >= 0 && p < book.pages.length) {
            setPage(p)
          }
        }}
        className="cursor-pointer"
      >
        {book.title}
      </h1>
      <Button onClick={onPrev} disabled={page <= 0}>
        prev
      </Button>
    </div>
  )
}

export default BookNavigation
