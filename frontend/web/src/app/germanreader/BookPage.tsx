import { Dispatch, SetStateAction, useMemo } from 'react'
import { arrayBufferToBase64, Book } from './domain'

interface Props {
  book: Book
  index: number
}

const BookPage = ({ book, index }: Props) => {
  const imageUrl = useMemo(() => {
    return `data:image/jpeg;base64,${arrayBufferToBase64(book.pages[index])}`
  }, [book.pages, index])

  return (
    <img
      src={imageUrl}
      className="max-h-full max-w-full block m-8 select-none"
      draggable={false}
    />
  )
}

export default BookPage
