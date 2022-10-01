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
  return (
    <div className="border-4 border-indigo-400 border-dashed p-16 m-16 text-indigo-400 opacity-6 text-4xl text-center hover:opacity-50 cursor-move">
      Drag book to import
    </div>
  )
}

export default Reader
