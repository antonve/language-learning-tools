import { useEffect, useState } from 'react'
import { Book } from '@app/mangareader/domain'
import {
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  HomeIcon,
} from '@heroicons/react/24/solid'

export function Navigation({
  book,
  page,
  setPage,
}: {
  book: Book
  page: number
  setPage: (p: number) => void
}) {
  const [hidden, setHidden] = useState(false)
  const [pageValue, setPageValue] = useState(page)

  useEffect(() => {
    setPageValue(page)
  }, [page])

  return (
    <div
      className="absolute top-5 left-5 bg-white shadow-lg z-50 rounded flex overflow-hidden items-center justify-center space-x-2"
      style={{ opacity: hidden ? 0 : 100 }}
    >
      <a
        href="#"
        onClick={() => setHidden(!hidden)}
        className="hover:bg-gray-100 block p-2"
      >
        <XMarkIcon className="h-5 w-5" />
      </a>
      {!hidden ? (
        <>
          <a
            href="#"
            onClick={() => setPage(page + 1)}
            className="hover:bg-gray-100 block p-2"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </a>
          <a
            href="#"
            onClick={() => setPage(page - 1)}
            className="hover:bg-gray-100 block p-2"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </a>
          <div className="pr-2">
            <input
              type="number"
              value={pageValue + 1}
              min={1}
              max={book.pages.length}
              onChange={e => setPageValue(e.currentTarget.valueAsNumber - 1)}
              onBlur={e => setPage(e.currentTarget.valueAsNumber - 1)}
              className="h-9 text-right w-14 border-none focus:outline-none focus:ring-0 focus:bg-gray-100 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />{' '}
            / {book.pages.length}
          </div>
          <a href="/" className="hover:bg-gray-100 flex items-center p-2 h-9 ">
            <HomeIcon className="h-4 w-4" />
          </a>
        </>
      ) : null}
    </div>
  )
}
