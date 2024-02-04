import type { NextPage } from 'next'
import {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
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
  ArrowRightEndOnRectangleIcon,
  HomeIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/solid'
import { TokenOverlays } from './Overlays'

type Position = {
  left: number
  right: number
  top: number
  bottom: number
}

type InitCardCreationFlow = (params: {
  sourceText: string
  meta: object
  sourceLanguage: string
  initialCropArea: Position
}) => void

type CreateCard = (params: {
  token: string
  image: string
  meta: object
}) => void

interface CardData {
  sourceText: string
  meta: object
}

interface PopupComponentProps {
  tokens: Tokens | undefined
  parentSize: {
    width: number
    height: number
  }
  initCardCreationFlow: InitCardCreationFlow
  close: () => void
}

type ViewMode = 'default' | 'crop'

export const usePersistedTargetLanguage = (
  sourceLanguageCode: string,
  defaultLanguageCode: string,
) => {
  const [targetLanguage, setTargetLanguage] = useState(defaultLanguageCode)

  const key = `target_language_${sourceLanguageCode}`
  const persist = (newTargetLanguage: string) => {
    localStorage.setItem(key, newTargetLanguage)
    setTargetLanguage(newTargetLanguage)
  }

  useEffect(() => {
    const persistedTargetLanguage = localStorage.getItem(key)
    if (persistedTargetLanguage !== null) {
      setTargetLanguage(persistedTargetLanguage)
    }
  }, [])

  return [targetLanguage, persist] as [string, Dispatch<SetStateAction<string>>]
}

interface Language {
  code: string
  description: string
}

function LanguageSelect({
  availableLanguages,
  targetLanguage,
  setTargetLanguage,
}: {
  availableLanguages: Language[]
  targetLanguage: string
  setTargetLanguage: (lang: string) => void
}) {
  return (
    <select
      className="border-none bg-gray-100 h-10"
      value={targetLanguage}
      onChange={e => setTargetLanguage(e.currentTarget.value)}
    >
      {availableLanguages.map(lang => (
        <option value={lang.code}>{lang.description}</option>
      ))}
    </select>
  )
}

function GermanPopupEditor({
  defaultToken,
  initCardCreationFlow,
  initialCropArea,
  close,
}: {
  defaultToken: string
  initCardCreationFlow: InitCardCreationFlow
  initialCropArea: Position
  close: () => void
}) {
  const [token, setToken] = useState(defaultToken)
  const debouncedToken = useDebounce(token, 500)
  const sourceLanguageCode = 'deu'
  const [targetLanguage, setTargetLanguage] = usePersistedTargetLanguage(
    sourceLanguageCode,
    'eng',
  )
  const translation = useTranslation(
    debouncedToken,
    sourceLanguageCode,
    targetLanguage,
    500,
  )

  return (
    <>
      <div className="flex justify-between items-center space-x-2">
        <input
          type="text"
          className="bg-gray-100 w-full text-2xl border-0 h-10 !ring-offset-0 !ring-0w"
          defaultValue={token}
          onChange={e => setToken(e.currentTarget.value.trim())}
        />
        <LanguageSelect
          targetLanguage={targetLanguage}
          setTargetLanguage={setTargetLanguage}
          availableLanguages={[
            { code: 'eng', description: 'EN' },
            { code: 'nld', description: 'NL' },
          ]}
        />
      </div>
      <a
        href="#"
        onClick={() => {
          initCardCreationFlow({
            sourceText: token,
            meta: {
              sentence: '',
              meaning: translation.data,
            },
            sourceLanguage: 'deu',
            initialCropArea,
          })
        }}
        className="flex justify-between items-center p-2 mt-2 hover:bg-gray-100"
      >
        <span className="text-2xl group">
          {translation.isLoading ? 'Loading' : null}
          {translation.isError
            ? `Error loading translation: ${translation.error.message}`
            : null}
          {translation.data ? translation.data : null}
        </span>
        <ArrowRightEndOnRectangleIcon className="h-7 w-7" />
      </a>

      <a
        href="#"
        onClick={close}
        className="text-red-900 hover:bg-gray-100 border flex justify-center items-center px-4 py-2 mt-4"
      >
        <span>Close</span>
      </a>
    </>
  )
}

function GermanPopup({
  tokens,
  parentSize,
  initCardCreationFlow,
  close,
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
        'bg-white border-2 border-black absolute z-20 p-2 text-xl shadow-md rounded min-w-[300px]',
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
        close={close}
      />
    </div>
  )
}

const MangaReader: NextPage<{
  useVertical: boolean
  PopupComponent: React.FC<PopupComponentProps>
  createCard: CreateCard
}> = ({ createCard, useVertical, PopupComponent = GermanPopup }) => {
  const [book, setBook] = useState<Book>()
  const [page, setPage] = useState(5)
  const [tokens, setTokens] = useState<Tokens | undefined>()
  const [viewMode, setViewMode] = useState<ViewMode>('default')
  const [cardData, setCardData] = useState<CardData | undefined>(undefined)
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
    const selectedIndices = new Map()
    setTokens({ selectedIndices, list: list.slice(1) })
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

  const initCardCreationFlow: InitCardCreationFlow = params => {
    setCardData(params)
    setCropPosition(params.initialCropArea)
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

  function exportCard() {
    if (!imageRef.current || !cardData) {
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

    console.log(tokens)
    tokens?.list
      .filter((token, i) => {
        const isSelected = tokens.selectedIndices.has(i)
        return isSelected
      })
      .map(token => {
        const { vertices } = token.bounding_poly
        const { top, left, height, width } = getPosition(vertices)
        context!.fillStyle = 'rgba(34, 197, 94, 0.2)'
        console.log(left, top, width, height)
        context!.fillRect(
          left - cropPosition.left,
          top - cropPosition.top,
          width,
          height,
        )
      })

    const prefix = 'data:image/jpeg;base64,'
    const panel = canvas.toDataURL('image/jpeg').slice(prefix.length)

    setViewMode('default')
    selectIndex(undefined)
    createCard({
      token: cardData.sourceText,
      image: panel,
      meta: cardData.meta,
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
        centerZoomedOut={false}
        zoomAnimation={{ disabled: true }}
        doubleClick={{ disabled: true }}
        panning={{
          excluded: ['input', 'select'],
          disabled: viewMode === 'crop',
        }}
      >
        <Navigation book={book} page={page} setPage={setPageSafely} />
        {viewMode === 'crop' ? (
          <>
            <div className="flex bg-white rounded shadow-lg absolute top-5 right-5 z-50 overflow-hidden divide-x">
              <a
                href="#"
                onClick={() => {
                  setViewMode('default')
                }}
                className="text-red-800 hover:bg-gray-200 px-4 py-2 items-center flex"
              >
                Cancel
                <XMarkIcon className="w-5 h-5 ml-2" />
              </a>
              <a
                href="#"
                className="hover:bg-gray-200 px-4 py-2 items-center flex"
                onClick={exportCard}
              >
                Export
                <ArrowRightEndOnRectangleIcon className="w-5 h-5 ml-2" />
              </a>
            </div>
          </>
        ) : null}
        {viewMode === 'default' ? (
          <>
            <div
              className="bg-black/5 hover:bg-black/30 absolute z-10 top-0 bottom-0 left-0 w-20 cursor-pointer flex items-center justify-center text-white"
              onClick={onNextPage}
            >
              <ChevronLeftIcon className="w-10 h-10" />
            </div>
            <div
              className="bg-black/5 hover:bg-black/30 absolute z-10 top-0 bottom-0 right-0 w-20 cursor-pointer flex items-center justify-center text-white"
              onClick={onPrevPage}
            >
              <ChevronRightIcon className="w-10 h-10" />
            </div>
          </>
        ) : null}
        {viewMode === 'default' && !tokens ? (
          <>
            <div className="flex bg-white rounded shadow-lg absolute top-5 right-5 z-50 overflow-hidden divide-x">
              <a
                href="#"
                onClick={() => {
                  loadOCR()
                }}
                className="bg-emerald-400 hover:bg-emerald-600 p-2 items-center flex"
              >
                <ArrowPathIcon className="w-5 h-5 text-white" />
              </a>
            </div>
          </>
        ) : null}
        <TransformComponent wrapperClass="!w-screen !h-screen bg-gray-200">
          <PageFocusControl page={page} />
          <div className="relative">
            {viewMode === 'default' ? (
              <>
                <PopupComponent
                  tokens={tokens}
                  parentSize={containerSize}
                  initCardCreationFlow={initCardCreationFlow}
                  close={() => selectIndex(undefined)}
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
            <TokenOverlays
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
        e.stopPropagation()
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
        onMouseDown={e => {
          e.stopPropagation()
          setMoveMode('move')
        }}
        onClick={e => {
          e.stopPropagation()
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

function PageFocusControl({ page }: { page: number }) {
  const { zoomToElement } = useControls()
  useEffect(() => {
    const timer = setTimeout(() => zoomToElement('page', undefined, 50), 100)
    return () => clearTimeout(timer)
  }, [page])

  return null
}
