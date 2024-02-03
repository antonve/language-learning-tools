import type { NextPage } from 'next'
import { useEffect, useMemo, useRef, useState } from 'react'
import BookImporter from '@app/mangareader/BookImporter'
import {
  Book,
  Tokens,
  arrayBufferToBase64,
  fetchDetectTexts,
  getPosition,
  useTranslation,
} from '@app/mangareader/domain'
import { useDebounce } from '@uidotdev/usehooks'
import Layout from '@app/Layout'
import { useKeyPress, useWindowSize } from '@app/mangareader/hooks'
import classNames from 'classnames'
import {
  TransformWrapper,
  TransformComponent,
  useControls,
} from 'react-zoom-pan-pinch'
import {
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/solid'

interface PopupComponentProps {
  tokens: Tokens | undefined
  parentSize: {
    width: number
    height: number
  }
}

function GermanPopupEditor({ defaultToken }: { defaultToken: string }) {
  const [token, setToken] = useState(defaultToken)
  const debouncedToken = useDebounce(token, 500)
  const translation = useTranslation(debouncedToken, 'deu', 'eng', 500)

  return (
    <>
      <input
        type="text"
        className="w-full text-2xl border-0 border-b p-0 !ring-offset-0 !ring-0"
        defaultValue={token}
        onChange={e => setToken(e.currentTarget.value.trim())}
      />
      <div>{translation.data ?? 'no data'}</div>
    </>
  )
}

function GermanPopup({ tokens, parentSize }: PopupComponentProps) {
  if (!tokens) {
    return null
  }

  const selectedTokens = Array.from(tokens.selectedIndices.keys())
    .sort()
    .map(i => tokens.list[i])

  if (selectedTokens.length === 0) {
    return null
  }

  const position = selectedTokens
    .map(it => it.bounding_poly.vertices)
    .reduce(
      (position, vertices) => {
        const { left, bottom, height } = getPosition(vertices)
        return {
          top: Math.max(position.top, bottom + height),
          left: Math.min(position.left, left),
        }
      },
      { top: 0, left: parentSize.width },
    )

  const selectedText = selectedTokens
    .map(it => it.description)
    .join(' ')
    .trim()
    .toLowerCase()

  return (
    <div
      className={classNames(
        'bg-white border-2 border-black absolute z-20 px-2 pb-2 text-xl shadow-md rounded',
        {},
      )}
      style={{ left: `${position.left + 5}px`, top: `${position.top + 5}px` }}
      key={selectedText}
      onClick={e => {
        e.stopPropagation()
      }}
    >
      <GermanPopupEditor defaultToken={selectedText} />
    </div>
  )
}

const MangaReader: NextPage<{
  useVertical: boolean
  PopupComponent: React.FC<PopupComponentProps>
}> = ({ useVertical, PopupComponent = GermanPopup }) => {
  const [book, setBook] = useState<Book>()
  const [page, setPage] = useState(5)
  const [tokens, setTokens] = useState<Tokens | undefined>()

  const imageUrl = useMemo(() => {
    if (!book) {
      return undefined
    }
    return `data:image/jpeg;base64,${arrayBufferToBase64(book.pages[page])}`
  }, [book?.pages, page])

  const containerRef = useRef<HTMLDivElement>(null)
  const containerSize = useWindowSize(containerRef.current)

  useKeyPress('ArrowLeft', onNextPage)
  useKeyPress('ArrowRight', onPrevPage)
  useKeyPress(' ', loadOCR)

  useEffect(() => setTokens(undefined), [page])

  async function loadOCR() {
    if (!book) {
      return
    }

    const list = await fetchDetectTexts(book.pages[page])
    setTokens({ selectedIndices: new Map(), list: list.slice(1) })
  }

  if (!book) {
    return (
      <Layout bodyClassName="">
        <div className="w-screen h-screen flex flex-col">
          <BookImporter setBook={setBook} />
        </div>
      </Layout>
    )
  }

  function setPageSafely(newPage: number) {
    if (!book) {
      return
    }

    if (book.pages.length <= newPage) {
      setPage(book.pages.length - 1)
      return
    }

    if (0 > newPage) {
      setPage(0)
      return
    }

    setPage(newPage)
  }

  function onNextPage() {
    setPageSafely(page + 1)
  }

  function onPrevPage() {
    setPageSafely(page - 1)
  }

  function selectIndex(i: number | undefined) {
    if (!tokens) {
      return
    }

    if (i === undefined) {
      setTokens({
        list: tokens.list,
        selectedIndices: new Map(),
      })

      return
    }

    const selectedIndices = new Map(tokens.selectedIndices)
    selectedIndices.set(i, true)
    setTokens({
      list: tokens.list,
      selectedIndices,
    })
  }

  return (
    <div ref={containerRef}>
      <TransformWrapper
        centerOnInit={true}
        smooth={true}
        maxScale={4}
        minScale={0.1}
        wheel={{
          smoothStep: 0.01,
        }}
        pinch={{ step: 0.01 }}
        limitToBounds={false}
        centerZoomedOut={true}
        zoomAnimation={{ disabled: true }}
        doubleClick={{ disabled: true }}
        panning={{ excluded: ['input'] }}
      >
        <Navigation book={book} page={page} setPage={setPageSafely} />
        <TransformComponent
          wrapperClass="!w-screen !h-screen bg-gray-200"
          wrapperProps={{
            onClick: () => {
              selectIndex(undefined)
            },
          }}
        >
          <PageFocusControl page={page} />
          <div className="relative">
            <PopupComponent tokens={tokens} parentSize={containerSize} />
            <Overlays
              tokens={tokens}
              useVertical={useVertical}
              selectIndex={selectIndex}
            />
            <div className="z-10 relative">
              <img
                src={imageUrl}
                className="select-none max-w-none w-auto h-auto max-h-none"
                draggable={false}
                id="page"
              />
            </div>
          </div>
        </TransformComponent>
      </TransformWrapper>
    </div>
  )
}

export default MangaReader

function Navigation({
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
              className="text-right w-14 border-none focus:outline-none focus:ring-0 focus:bg-gray-100 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />{' '}
            / {book.pages.length}
          </div>
        </>
      ) : null}
    </div>
  )
}

function PageFocusControl({ page }: { page: number }) {
  const { zoomToElement } = useControls()
  useEffect(() => {
    const timer = setTimeout(() => zoomToElement('page', undefined, 50), 100)
    return () => clearTimeout(timer)
  }, [page])

  return null
}

function Overlays({
  tokens,
  useVertical,
  selectIndex,
}: {
  tokens: Tokens | undefined
  useVertical: boolean
  selectIndex: (i: number) => void
}) {
  if (!tokens) {
    return null
  }

  return (
    <>
      {tokens.list.map((token, i) => {
        const { vertices } = token.bounding_poly
        const { top, left, height, width } = getPosition(vertices)
        const isSelected = tokens.selectedIndices.has(i)

        return (
          <div
            key={i}
            className={classNames(
              'absolute z-30 block font-bold cursor-pointer',
              {
                'bg-green-500/20': isSelected,
                '': !isSelected,
              },
            )}
            style={{
              top: `${top}px`,
              left: `${left}px`,
              height: `${height}px`,
              width: `${width}px`,
              fontSize: useVertical ? `${width}px` : `${height}px`,
              lineHeight: '1',
              fontFamily: '"Comic Neue", cursive',
              writingMode: useVertical ? 'vertical-rl' : 'horizontal-tb',
            }}
            onClick={e => {
              e.stopPropagation()
              selectIndex(i)
            }}
          ></div>
        )
      })}
    </>
  )
}
