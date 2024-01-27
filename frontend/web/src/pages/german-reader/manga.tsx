import type { NextPage } from 'next'
import { useEffect, useMemo, useRef, useState } from 'react'
import BookImporter from '@app/germanreader/BookImporter'
import {
  Book,
  arrayBufferToBase64,
  fetchDetectTexts,
} from '@app/germanreader/domain'
import Layout from '@app/Layout'
import { useKeyPress, useWindowSize } from '@app/germanreader/hooks'
import usePanZoom from 'use-pan-and-zoom'

const GermanMangaReader: NextPage<{ useVertical: boolean }> = ({
  useVertical = false,
}) => {
  const [book, setBook] = useState<Book>()
  const [page, setPage] = useState(0)
  const [words, setWords] = useState<any | undefined>()
  const {
    transform,
    container,
    setContainer,
    panZoomHandlers,
    setPan,
    setZoom,
    center,
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

  useEffect(() => setWords(undefined), [page])

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
      console.log(
        `container height: ${containerSize.height}, image height: ${imageSize.height}, zoom: ${verticalZoomLevel}`,
      )
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

    const texts = await fetchDetectTexts(book.pages[page])
    setWords(texts)
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

  return (
    <div
      ref={el => setContainer(el)}
      className="w-screen h-screen flex items-center justify-center overflow-hidden"
      contentEditable={false}
      style={{ touchAction: 'none' }}
      {...panZoomHandlers}
    >
      <div style={{ transform }} className="relative">
        <Overlays words={words} useVertical={useVertical} />
        <div className="z-10 relative">
          <img
            src={imageUrl}
            className="block select-none"
            draggable={false}
            ref={imageRef}
          />
        </div>
      </div>
    </div>
  )
}

export default GermanMangaReader

function Overlays({
  words,
  useVertical,
}: {
  words: any[] | undefined
  useVertical: boolean
}) {
  if (!words) {
    return null
  }

  return (
    <>
      {words.slice(1).map((word, i) => {
        const { vertices } = word.bounding_poly
        const y = vertices.map((it: { y: number }) => it.y)
        const x = vertices.map((it: { x: number }) => it.x)
        const top = Math.min(...y)
        const bottom = Math.max(...y)
        const left = Math.min(...x)
        const right = Math.max(...x)
        const height = bottom - top
        const width = right - left

        return (
          <div
            key={i}
            className="absolute z-50 block opacity-0 hover:opacity-100 font-bold"
            style={{
              backgroundColor: 'white',
              top: `${top}px`,
              left: `${left}px`,
              minHeight: `${height}px`,
              minWidth: `${width}px`,
              fontSize: useVertical ? `${width}px` : `${height}px`,
              lineHeight: '1',
              fontFamily: '"Comic Neue", cursive',
              writingMode: useVertical ? 'vertical-rl' : 'sideways-lr',
            }}
          >
            {word.description}
          </div>
        )
      })}
    </>
  )
}
