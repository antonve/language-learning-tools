interface Book {}

interface Props {
  book: Book | undefined
}

const Reader = ({ book }: Props) => {
  if (!book) {
    return <>Show book importer</>
  }

  return <>Show book reader</>
}

export default Reader
