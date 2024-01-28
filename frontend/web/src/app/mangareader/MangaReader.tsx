import type { NextPage } from 'next'
import { useEffect, useMemo, useRef, useState } from 'react'
import BookImporter from '@app/mangareader/BookImporter'
import {
  Book,
  Tokens,
  arrayBufferToBase64,
  fetchDetectTexts,
} from '@app/mangareader/domain'
import Layout from '@app/Layout'
import { useKeyPress, useWindowSize } from '@app/mangareader/hooks'
import usePanZoom from 'use-pan-and-zoom'
import classNames from 'classnames'

const MangaReader: NextPage<{ useVertical: boolean }> = ({ useVertical }) => {
  const [book, setBook] = useState<Book>()
  const [page, setPage] = useState(0)
  const [tokens, setTokens] = useState<Tokens | undefined>()
  const {
    transform,
    container,
    setContainer,
    panZoomHandlers,
    setPan,
    setZoom,
  } = usePanZoom({
    maxZoom: 2,
    minZoom: 0.3,
  })

  const imageUrl = useMemo(() => {
    if (!book) {
      return undefined
    }
    return `data:image/jpeg;base64,${arrayBufferToBase64(book.pages[page])}`
  }, [book?.pages, page])

  const imageRef = useRef<HTMLImageElement>(null)

  const containerSize = useWindowSize(container)
  const imageSize = useWindowSize(imageRef.current)

  useKeyPress('ArrowLeft', onNextPage)
  useKeyPress('ArrowRight', onPrevPage)
  useKeyPress(' ', loadOCR)

  useEffect(() => setTokens(undefined), [page])

  useEffect(() => {
    centerFitPage()
  }, [book?.pages, page, imageRef.current?.height, containerSize])

  function centerFitPage() {
    const imageHeight = imageRef.current?.height
    if (!book || !imageHeight) {
      return
    }

    // hack to make sure image is rendered before rendering page
    setTimeout(() => {
      const verticalZoomLevel = containerSize.height / imageHeight
      setPan({ x: 0, y: 0 })

      if (!isNaN(verticalZoomLevel)) {
        setZoom(verticalZoomLevel)
      }
    }, 1)
  }

  async function loadOCR() {
    if (!book) {
      return
    }

    const list = await fetchDetectTexts(book.pages[page])
    setTokens({ selectedIndices: new Map(), list })
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
    <div
      ref={el => setContainer(el)}
      className="w-screen h-screen flex items-center justify-center overflow-hidden"
      contentEditable={false}
      style={{ touchAction: 'none' }}
      {...panZoomHandlers}
    >
      <div style={{ transform }} className="relative">
        <Overlays
          tokens={tokens}
          useVertical={useVertical}
          selectIndex={selectIndex}
        />
        <div className="z-10 relative">
          <img
            src={imageUrl}
            className="block select-none"
            draggable={false}
            ref={imageRef}
            onClick={() => selectIndex(undefined)}
          />
        </div>
      </div>
    </div>
  )
}

export default MangaReader

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
      {tokens.list.slice(1).map((token, i) => {
        const { vertices } = token.bounding_poly
        const y = vertices.map(it => it.y)
        const x = vertices.map(it => it.x)
        const top = Math.min(...y)
        const bottom = Math.max(...y)
        const left = Math.min(...x)
        const right = Math.max(...x)
        const height = bottom - top
        const width = right - left
        const isSelected = tokens.selectedIndices.has(i)

        return (
          <div
            key={i}
            className={classNames(
              'absolute z-50 block font-bold cursor-pointer',
              {
                'bg-green-500/20': isSelected,
                '': !isSelected,
              },
            )}
            style={{
              top: `${top}px`,
              left: `${left}px`,
              minHeight: `${height}px`,
              minWidth: `${width}px`,
              fontSize: useVertical ? `${width}px` : `${height}px`,
              lineHeight: '1',
              fontFamily: '"Comic Neue", cursive',
              writingMode: useVertical ? 'vertical-rl' : 'sideways-lr',
            }}
            onClick={() => selectIndex(i)}
          ></div>
        )
      })}
    </>
  )
}
