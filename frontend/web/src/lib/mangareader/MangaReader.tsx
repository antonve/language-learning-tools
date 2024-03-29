import type { NextPage } from 'next'
import { useEffect, useMemo, useRef, useState } from 'react'
import BookImporter from 'src/lib/mangareader/BookImporter'
import {
  Book,
  Tokens,
  arrayBufferToBase64,
  fetchDetectTexts,
  getPosition,
} from 'src/lib/mangareader/domain'
import Layout from 'src/lib/Layout'
import { useKeyPress, useWindowSize } from 'src/lib/mangareader/hooks'
import {
  TransformWrapper,
  TransformComponent,
  useControls,
} from 'react-zoom-pan-pinch'
import {
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowRightEndOnRectangleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/solid'
import { TokenOverlays } from 'src/lib/mangareader/Overlays'
import { Navigation } from 'src/lib/mangareader/Navigation'
import { Cropper } from 'src/lib/mangareader/Cropper'
import { Popup } from 'src/lib/mangareader/Popup'

export type Position = {
  left: number
  right: number
  top: number
  bottom: number
}

export type InitCardCreationFlow = (params: {
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

export interface PopupEditorProps {
  defaultToken: string
  initCardCreationFlow: InitCardCreationFlow
  initialCropArea: Position
  close: () => void
}

type ViewMode = 'default' | 'crop'

const MangaReader: NextPage<{
  useVertical: boolean
  PopupEditor: React.FC<PopupEditorProps>
  createCard: CreateCard
  sentenceJoinCharacter?: string
}> = ({
  createCard,
  useVertical,
  PopupEditor,
  sentenceJoinCharacter = ' ',
}) => {
  const [book, setBook] = useState<Book>()
  const [page, setPage] = useState(0)
  const [tokens, setTokens] = useState<Tokens | undefined>()
  const [viewMode, setViewMode] = useState<ViewMode>('default')
  const [cardData, setCardData] = useState<CardData | undefined>(undefined)
  const [cropPosition, setCropPosition] = useState<Position>({
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  })

  // disable pull to refresh on safari
  useEffect(() => {
    document.body.classList.add('overflow-hidden')
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

  function sentenceFromCropPosition() {
    if (!cropPosition || !tokens) {
      return undefined
    }

    const tokensWithinCropPosition = tokens.list.filter(token => {
      const { left, right, top, bottom } = getPosition(
        token.bounding_poly.vertices,
      )

      return (
        left >= cropPosition.left &&
        right <= cropPosition.right &&
        top >= cropPosition.top &&
        bottom <= cropPosition.bottom
      )
    })

    return tokensWithinCropPosition
      .map(it => it.description)
      .join(sentenceJoinCharacter)
      .toLocaleLowerCase()
      .replaceAll(' ,', ',')
      .replaceAll(' .', '.')
      .replaceAll(' !', '!')
      .replaceAll(' ?', '?')
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
      meta: {
        sentence: sentenceFromCropPosition(),
        ...cardData.meta,
      },
    })
  }

  const hasSelectedTokens = tokens && tokens.selectedIndices.size > 0

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
        {viewMode === 'default' && !hasSelectedTokens ? (
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
                <Popup
                  tokens={tokens}
                  parentSize={containerSize}
                  initCardCreationFlow={initCardCreationFlow}
                  close={() => selectIndex(undefined)}
                  PopupEditor={PopupEditor}
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

function PageFocusControl({ page }: { page: number }) {
  const { zoomToElement } = useControls()
  useEffect(() => {
    const timer = setTimeout(() => zoomToElement('page', undefined, 50), 100)
    return () => clearTimeout(timer)
  }, [page])

  return null
}
