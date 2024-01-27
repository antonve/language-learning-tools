import type { NextPage } from 'next'
import { useEffect, useMemo, useRef, useState } from 'react'
import BookImporter from '@app/germanreader/BookImporter'
import BookPage from '@app/germanreader/BookPage'
import { Book, arrayBufferToBase64, fetchOcr } from '@app/germanreader/domain'
import Layout from '@app/Layout'
import { useKeyPress, useWindowSize } from '@app/germanreader/hooks'
import usePanZoom from 'use-pan-and-zoom'

const GermanMangaReader: NextPage<{}> = () => {
  const [book, setBook] = useState<Book>()
  const [page, setPage] = useState(0)
  const [ocr, setOCR] = useState<any | undefined>()
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

  useEffect(() => setOCR(undefined), [page])

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

  const loadOCR = async () => {
    if (!book) {
      return
    }

    const ocr = await fetchOcr(book.pages[page])
    setOCR(ocr)
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
      <div style={{ transform }}>
        <img
          src={imageUrl}
          className="max-h-full max-w-full block m-8 select-none"
          draggable={false}
          ref={imageRef}
        />
      </div>
    </div>
  )
}

export default GermanMangaReader
