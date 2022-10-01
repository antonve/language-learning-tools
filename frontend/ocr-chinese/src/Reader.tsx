import { useEffect, useState } from 'react'

interface Book {}

interface Props {
  book: Book | undefined
}

const Reader = ({ book }: Props) => {
  if (!book) {
    return <BookImporter />
  }

  return <>Show book reader</>
}

const BookImporter = () => {
  const [book, setBook] = useState<any>()

  useEffect(() => {
    if (!book) {
      return
    }

    console.log(book)
    const reader = new FileReader()
    // reader.onload = e => console.log('loaded', e.target?.result)
    reader.readAsDataURL(book)
  }, [book])

  return (
    <div className="border-4 border-indigo-400 border-dashed p-16 m-16 text-indigo-400 opacity-6 text-4xl text-center hover:opacity-50 cursor-move relative">
      Drag book to import
      <input
        type="file"
        className="absolute left-0 right-0 top-0 bottom-0 opacity-0"
        onChange={e => {
          setBook(e.target.files?.[0])
        }}
      />
    </div>
  )
}

export default Reader
