import { processBook } from './domain'

const BookImporter = ({ setBook }: { setBook: (book: any) => void }) => {
  return (
    <div className="border-4 border-black-400 border-dashed p-16 m-16 text-gray-400 opacity-6 text-4xl text-center hover:opacity-50 cursor-move relative h-full flex items-center justify-center">
      Drag book to import
      <input
        type="file"
        className="absolute left-0 right-0 top-0 bottom-0 opacity-0"
        accept=".zip"
        onChange={async e => {
          const file = e.target.files?.[0]

          if (!file) {
            return
          }

          const book = await processBook(file)
          setBook(book)
        }}
      />
    </div>
  )
}

export default BookImporter
