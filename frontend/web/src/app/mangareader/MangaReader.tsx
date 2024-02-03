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

  function onNextPage() {
    if (!book || book.pages.length - 1 <= page) {
      return
    }
    setPage(page + 1)
  }

  function onPrevPage() {
    if (page <= 0) {
      return
    }
    setPage(page - 1)
  }

  function selectIndex(i: number | undefined) {
    if (!tokens) {
      return
    }

    if (!i) {
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
      >
        <TransformComponent wrapperClass="relative !w-screen !h-screen">
          <PageFocusControl page={page} />
          <div className="" onClick={() => console.log('div.relative clicked')}>
            <PopupComponent tokens={tokens} parentSize={containerSize} />
            <Overlays
              tokens={tokens}
              useVertical={useVertical}
              selectIndex={selectIndex}
            />
            <div
              className="z-10 relative"
              onClick={() => {
                console.log('div.img clicked')
                selectIndex(undefined)
              }}
            >
              <img
                src={imageUrl}
                className="select-none w-auto h-auto max-w-full max-h-full"
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

function PageFocusControl({ page }: { page: number }) {
  const { zoomToElement } = useControls()
  useEffect(() => {
    zoomToElement('page', undefined, 50)
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
            onClick={() => selectIndex(i)}
          >
            {token.description}
          </div>
        )
      })}
    </>
  )
}
