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

export default BookNavigation
