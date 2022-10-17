import type { NextPage } from 'next'
import { useState } from 'react'
import BookImporter from '../src/BookImporter'

const Home: NextPage<{}> = () => {
  const [book, setBook] = useState<File>()

  return (
    <div className="bg-gray-900 h-screen w-screen flex flex-col">
      <header
        className={`border-t-4 border-pink-400 p-4 justify-between box-border`}
      >
        <h1 className="text-gray-100 text-base no-underline hover:no-underline font-extrabold text-xl">
          Chinese OCR
        </h1>
      </header>
      <div className="flex bg-white flex-grow ">
        <div className="w-full flex h-full flex-grow">
          <div className="flex-grow h-full">
            <Reader book={book} setBook={setBook} />
          </div>
          <div className="bg-pink-400 w-1/5">sidebar</div>
        </div>
      </div>
    </div>
  )
}

interface Props {
  book: File | undefined
  setBook: (file: File | undefined) => void
}

const Reader = ({ book, setBook }: Props) => {
  if (!book) {
    return <BookImporter setBook={setBook} />
  }

  return null
}

export default Home
