import React, { useEffect, useRef, useState } from 'react'
import ePub, { Rendition, Location } from 'epubjs'
import { useSwipeable, SwipeEventData } from 'react-swipeable'

interface ReaderProps {
  url: any
  fontSize?: string
  fontFamily?: string
  fontColor?: string

  cfi?: string

  onLoad?: (rendition?: Rendition) => void
  onNext?: (rendition?: Rendition) => void
  onPrev?: (rendition?: Rendition) => void
  onRelocated?: (location?: Location) => void

  renderChapters?: (tocs: any) => React.ReactNode
}

export const EpubReader: React.FC<ReaderProps> = ({
  url,
  fontSize,
  fontFamily,
  fontColor,
  onLoad,
  onNext,
  onPrev,
  onRelocated,
  cfi,
}) => {
  const ref = useRef<HTMLDivElement>(null)
  const [rendition, setRendition] = useState<Rendition | null>(null)
  const [isMoreShow, setIsMoreShow] = useState<boolean>(false)
  const [info, setInfo] = useState()
  const [percent, setPercent] = useState(0)
  const swipeHandlers = useSwipeable({
    onSwiped: (eventData: SwipeEventData) => {
      const { dir } = eventData
      console.log('swiped', dir)
      if (dir === 'Left') handleNext()
      if (dir === 'Right') handlePrev()
    },
  })

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ebook = ePub(url)
    const rendition = ebook.renderTo(el, {
      flow: 'paginated',
      width: '100%',
      height: '100%',
    })
    onReaderLoad(ebook, rendition)
  }, [])

  const onReaderLoad = (ebook: any, rendition: Rendition) => {
    if (!rendition) return
    setRendition(rendition)

    cfi ? rendition.display(cfi) : rendition.display()

    setupStyles(rendition)

    ebook.ready.then(async () => {
      const { package: { metadata = {} } = {} } = ebook
      setInfo(metadata)

      await ebook.locations.generate(1600)

      onLoad && onLoad(rendition)
      onRelocated && rendition.on('relocated', handleRelocated(ebook))
    })
  }

  const setupStyles = (rendition: any) => {
    fontSize &&
      rendition.themes.default({ p: { 'font-size': `${fontSize} !important` } })
    fontColor &&
      rendition.themes.default({ p: { color: `${fontColor} !important` } })
    fontFamily &&
      rendition.themes.default({
        p: { fontFamily: `${fontFamily} !important` },
      })
  }

  const handleRelocated =
    (ebook: any) =>
    (location: Location): void => {
      onRelocated && onRelocated(location)

      const percent = ebook.locations.percentageFromCfi(location.start.cfi)
      setPercent(percent)
    }

  const handleNext = () => {
    if (!rendition) return
    rendition.next()
    onNext && onNext(rendition)
  }

  const handlePrev = () => {
    if (!rendition) return
    rendition.prev()
    onPrev && onPrev(rendition)
  }

  return (
    <>
      <div className="flex space-x-16">
        <button onClick={handlePrev}>prev</button>
        <button onClick={handleNext}>next</button>
      </div>
      <div {...swipeHandlers} className="w-full h-full">
        {!rendition && <>Loading...</>}
        <div ref={ref} className="w-full h-full" />
      </div>
    </>
  )
}

export default EpubReader
