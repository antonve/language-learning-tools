import {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  arrayBufferToBase64,
  Book,
  FocusWord,
  OcrBoundingBox,
  OcrResult,
} from './domain'
import { useWindowSize } from './hooks'

interface Props {
  book: Book
  index: number
  ocr: OcrResult | undefined
  focusWord: FocusWord | undefined
  setCanvasData: Dispatch<SetStateAction<string>>
  onPrevPage: () => void
  onNextPage: () => void
}

const BookPage = ({
  book,
  index,
  ocr,
  focusWord,
  setCanvasData,
  onNextPage,
  onPrevPage,
}: Props) => {
  const imageUrl = useMemo(() => {
    return `data:image/jpeg;base64,${arrayBufferToBase64(book.pages[index])}`
  }, [book.pages, index])

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [fitToScreen, setFitToScreen] = useState(true)

  const containerSize = useWindowSize(containerRef.current)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }

    const context = canvas.getContext('2d')
    if (!context) {
      return
    }

    const container = containerRef.current
    if (!container) {
      return
    }
    var img = new Image()
    img.src = imageUrl

    img.onload = function () {
      if (fitToScreen) {
        canvas.width = containerSize.width
        canvas.height = containerSize.height
      } else {
        canvas.width = img.width
        canvas.height = img.height
      }

      let scale = fitToScreen
        ? Math.min(canvas.width / img.width, canvas.height / img.height)
        : 1
      console.log(fitToScreen, scale, canvas.width, canvas.height)
      let width = img.width * scale
      let height = img.height * scale
      let x = canvas.width / 2 - width / 2
      let y = canvas.height / 2 - height / 2

      context.drawImage(img, x, y, width, height)

      const drawPath = (box: OcrBoundingBox) => {
        const { vertices } = box
        context.beginPath()
        context.moveTo(
          x + vertices[0].x * scale - 5,
          y + vertices[0].y * scale - 5,
        )
        context.lineTo(
          x + vertices[1].x * scale + 5,
          y + vertices[1].y * scale - 5,
        )
        context.lineTo(
          x + vertices[2].x * scale + 5,
          y + vertices[2].y * scale + 5,
        )
        context.lineTo(
          x + vertices[3].x * scale - 5,
          y + vertices[3].y * scale + 5,
        )
        context.closePath()
      }

      if (focusWord) {
        drawPath(focusWord.block.bounding_box)

        context.strokeStyle = 'rgba(163,230,53, 0.5)'
        context.lineWidth = 2
        context.stroke()

        drawPath(focusWord.word.boundingBox)
        context.fillStyle = 'rgba(254, 240, 138, 0.2)'
        context.fill()
      }

      setCanvasData(canvas.toDataURL('image/jpeg'))
    }

    return () => {}
  }, [
    canvasRef,
    containerRef,
    imageUrl,
    containerSize,
    ocr,
    focusWord,
    setCanvasData,
    fitToScreen,
  ])

  return (
    <div
      ref={containerRef}
      className={`${fitToScreen ? 'flex-grow' : ''} relative`}
    >
      <div className="absolute left-0 top-0 bottom-0 right-0 flex z-50">
        <div className="w-1/5 cursor-w-resize" onClick={onNextPage} />
        <div
          className={`w-3/5 ${
            fitToScreen ? 'cursor-zoom-in' : 'cursor-zoom-out'
          }`}
          onClick={() => {
            console.log(fitToScreen)
            setFitToScreen(!fitToScreen)
          }}
        />
        <div className="w-1/5 cursor-e-resize" onClick={onPrevPage} />
      </div>
      <canvas
        ref={canvasRef}
        className={`${fitToScreen ? 'w-full h-full absolute' : ''} z-10`}
      />
    </div>
  )
}

export default BookPage
