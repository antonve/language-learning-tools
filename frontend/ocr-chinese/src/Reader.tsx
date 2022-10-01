import { useEffect, useState } from 'react'

interface Props {}

const Reader = ({}: Props) => {
  const [book, setBook] = useState()

  useEffect(() => {
    if (!book) {
      return
    }

    console.log(book)
    // const reader = new FileReader()
    // reader.onload = e => console.log('loaded', e.target)
    // reader.readAsDataURL(book)
  }, [book])

  if (!book) {
    return <BookImporter setBook={setBook} />
  }

  return <>Show book reader</>
}

const BookImporter = ({ setBook }: { setBook: (book: any) => void }) => {
  return (
    <div className="border-4 border-indigo-400 border-dashed p-16 m-16 text-indigo-400 opacity-6 text-4xl text-center hover:opacity-50 cursor-move relative">
      Drag book to import
      <input
        type="file"
        className="absolute left-0 right-0 top-0 bottom-0 opacity-0"
        accept=".epub"
        onChange={e => {
          setBook(e.target.files?.[0])
        }}
      />
    </div>
  )
}

export default Reader
