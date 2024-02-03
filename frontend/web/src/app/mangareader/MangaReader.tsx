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
  useTransformContext,
} from 'react-zoom-pan-pinch'
import {
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckIcon,
} from '@heroicons/react/24/solid'

type Position = {
  left: number
  right: number
  top: number
  bottom: number
}

type InitCardCreationFlow = (
  sourceText: string,
  targetText: string | undefined,
  sourceLanguage: string,
  targetLanguage: string,
  initialCropArea: Position,
) => void

interface PopupComponentProps {
  tokens: Tokens | undefined
  parentSize: {
    width: number
    height: number
  }
  initCardCreationFlow: InitCardCreationFlow
}

type ViewMode = 'default' | 'crop'

function GermanPopupEditor({
  defaultToken,
  initCardCreationFlow,
  initialCropArea,
}: {
  defaultToken: string
  initCardCreationFlow: InitCardCreationFlow
  initialCropArea: Position
}) {
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
      <div
        onClick={() => {
          initCardCreationFlow(
            token,
            translation.data,
            'deu',
            'eng',
            initialCropArea,
          )
        }}
      >
        {translation.data ?? 'no data'}
      </div>
    </>
  )
}

function GermanPopup({
  tokens,
  parentSize,
  initCardCreationFlow,
}: PopupComponentProps) {
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

  const selectedTextCropArea = selectedTokens
    .map(it => getPosition(it.bounding_poly.vertices))
    .reduce(
      (prev, current) => {
        return {
          top: Math.min(prev.top, current.top),
          bottom: Math.max(prev.bottom, current.bottom),
          left: Math.min(prev.left, current.left),
          right: Math.max(prev.right, current.right),
        }
      },
      {
        top: parentSize.height,
        bottom: 0,
        left: parentSize.width,
        right: 0,
      },
    )

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
      <GermanPopupEditor
        defaultToken={selectedText}
        initCardCreationFlow={initCardCreationFlow}
        initialCropArea={selectedTextCropArea}
      />
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
  const [viewMode, setViewMode] = useState<ViewMode>('default')
  const [cropPosition, setCropPosition] = useState<Position>({
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  })

  const imageUrl = useMemo(() => {
    if (!book) {
      return undefined
    }
    return `data:image/jpeg;base64,${arrayBufferToBase64(book.pages[page])}`
  }, [book?.pages, page])

  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
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

  const initCardCreationFlow: InitCardCreationFlow = (
    sourceText,
    targetText,
    sourceLanguage,
    targetLanguage,
    initialCropArea,
  ) => {
    setCropPosition(initialCropArea)
    setViewMode('crop')
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
        panning={{ excluded: ['input'], disabled: viewMode === 'crop' }}
      >
        <Navigation book={book} page={page} setPage={setPageSafely} />
        {viewMode === 'crop' ? (
          <a
            href="#"
            className="flex bg-white hover:bg-gray-200 rounded shadow-lg absolute top-5 right-5 z-50 px-4 py-2 items-center"
            onClick={() => {
              // setViewMode('default')
              if (!imageRef.current) {
                return
              }
              const canvas = document.createElement('canvas')
              canvas.width = cropPosition.right - cropPosition.left
              canvas.height = cropPosition.bottom - cropPosition.top
              const context = canvas.getContext('2d')

              context?.drawImage(
                imageRef.current,
                cropPosition.left,
                cropPosition.top,
                canvas.width,
                canvas.height,
                0,
                0,
                canvas.width,
                canvas.height,
              )

              const panel = canvas.toDataURL('image/png')
              window.open(panel, '_blank')
            }}
          >
            Crop panel
            <CheckIcon className="w-5 h-5 text-green-700 ml-2" />
          </a>
        ) : null}
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
            {viewMode === 'default' ? (
              <>
                <PopupComponent
                  tokens={tokens}
                  parentSize={containerSize}
                  initCardCreationFlow={initCardCreationFlow}
                />
                <Overlays
                  tokens={tokens}
                  useVertical={useVertical}
                  selectIndex={selectIndex}
                />
              </>
            ) : null}
            {viewMode === 'crop' ? (
              <>
                <Cropper
                  position={cropPosition}
                  setCropPosition={setCropPosition}
                  parentSize={containerSize}
                />
              </>
            ) : null}
            <div className="z-10 relative">
              <img
                src={imageUrl}
                className="select-none max-w-none w-auto h-auto max-h-none"
                draggable={false}
                id="page"
                ref={imageRef}
              />
            </div>
          </div>
        </TransformComponent>
      </TransformWrapper>
    </div>
  )
}

export default MangaReader

function clamp(n: number, [min, max]: number[]) {
  return Math.min(Math.max(n, min), max)
}

type CropMoveMode =
  | 'idle'
  | 'move'
  | 'resize-sw' // south west
  | 'resize-se' // south east
  | 'resize-nw' // north west
  | 'resize-ne' // north east

function Cropper({
  position,
  setCropPosition,
  parentSize,
}: {
  position: Position
  setCropPosition: (position: Position) => void
  parentSize: {
    width: number
    height: number
  }
}) {
  const {
    transformState: { scale },
  } = useTransformContext()
  const [moveMode, setMoveMode] = useState<CropMoveMode>('idle')

  useEffect(() => console.log(moveMode), [moveMode])

  return (
    <div
      className="absolute top-0 bottom-0 left-0 right-0 z-40"
      onMouseLeave={() => setMoveMode('idle')}
      onMouseMove={e => {
        if (moveMode === 'idle') {
          return
        }

        let newPos = { ...position }
        const bounds = e.currentTarget.getBoundingClientRect()

        switch (moveMode) {
          case 'move':
            const width = position.right - position.left
            const height = position.bottom - position.top

            newPos.left = newPos.left + e.movementX / scale
            newPos.top = newPos.top + e.movementY / scale
            newPos.right = newPos.left + width
            newPos.bottom = newPos.top + height

            // Make moved rectangle doesn't go out of bounds
            if (newPos.left < 0) {
              newPos.left = 0
              newPos.right = newPos.left + width
            }
            if (newPos.top < 0) {
              newPos.top = 0
              newPos.bottom = newPos.top + height
            }

            const maxRight = bounds.width / scale
            if (newPos.right > maxRight) {
              newPos.right = maxRight
              newPos.left = maxRight - width
            }

            const maxBottom = bounds.height / scale
            if (newPos.bottom > maxBottom) {
              newPos.bottom = maxBottom
              newPos.top = maxBottom - height
            }

            break
          case 'resize-nw':
            newPos.left = (e.pageX - bounds.left) / scale
            newPos.top = (e.pageY - bounds.top) / scale

            // Clamp to page size
            newPos.left = clamp(newPos.left, [0, newPos.right - 10])
            newPos.top = clamp(newPos.top, [0, newPos.bottom - 10])
            break
          case 'resize-ne':
            newPos.right = (e.pageX - bounds.left) / scale
            newPos.top = (e.pageY - bounds.top) / scale

            // Clamp to page size
            newPos.right = clamp(newPos.right, [
              newPos.left + 10,
              parentSize.width / scale,
            ])
            newPos.top = clamp(newPos.top, [0, newPos.bottom - 10])
            break
          case 'resize-se':
            newPos.right = (e.pageX - bounds.left) / scale
            newPos.bottom = (e.pageY - bounds.top) / scale

            // Clamp to page size
            newPos.right = clamp(newPos.right, [
              newPos.left + 10,
              parentSize.width / scale,
            ])
            newPos.bottom = clamp(newPos.bottom, [
              newPos.top + 10,
              parentSize.height / scale,
            ])

            break
          case 'resize-sw':
            newPos.left = (e.pageX - bounds.left) / scale
            newPos.bottom = (e.pageY - bounds.top) / scale

            // Clamp to page size
            newPos.left = clamp(newPos.left, [0, newPos.right - 10])
            newPos.bottom = clamp(newPos.bottom, [
              newPos.top + 10,
              parentSize.height / scale,
            ])
            break
        }

        setCropPosition(newPos)
      }}
      onMouseUp={() => setMoveMode('idle')}
    >
      <div
        className="bg-transparent relative border border-dashed border-black z-50 cursor-move"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
          width: `${position.right - position.left}px`,
          height: `${position.bottom - position.top}px`,
          boxShadow: `0 0 0 99999px rgba(0, 0, 0, .6)`,
        }}
        onMouseDown={() => {
          setMoveMode('move')
        }}
      >
        <div
          className="w-2 h-2 bg-white border border-black absolute -top-1 -left-1 cursor-nwse-resize"
          onMouseDown={e => {
            e.stopPropagation()
            setMoveMode('resize-nw')
          }}
        ></div>
        <div
          className="w-2 h-2 bg-white border border-black absolute -top-1 -right-1 cursor-nesw-resize"
          onMouseDown={e => {
            e.stopPropagation()
            setMoveMode('resize-ne')
          }}
        ></div>
        <div
          className="w-2 h-2 bg-white border border-black absolute -bottom-1 -right-1 cursor-nwse-resize"
          onMouseDown={e => {
            e.stopPropagation()
            setMoveMode('resize-se')
          }}
        ></div>
        <div
          className="w-2 h-2 bg-white border border-black absolute -bottom-1 -left-1 cursor-nesw-resize"
          onMouseDown={e => {
            e.stopPropagation()
            setMoveMode('resize-sw')
          }}
        ></div>
      </div>
    </div>
  )
}

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
