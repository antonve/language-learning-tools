import { useEffect, useMemo, useRef } from 'react'
import { arrayBufferToBase64, Book, OcrResult } from './domain'
import { useWindowSize } from './hooks'

interface Props {
  book: Book
  index: number
  ocr: OcrResult | undefined
}

const BookPage = ({ book, index, ocr }: Props) => {
  const imageUrl = useMemo(() => {
    return `data:image/jpeg;base64,${arrayBufferToBase64(book.pages[index])}`
  }, [book.pages, index])

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

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
      canvas.width = containerSize.width
      canvas.height = containerSize.height

      let scale = Math.min(canvas.width / img.width, canvas.height / img.height)
      let width = img.width * scale
      let height = img.height * scale
      let x = canvas.width / 2 - width / 2
      let y = canvas.height / 2 - height / 2

      context.drawImage(img, x, y, width, height)

      if (!ocr) {
        return
      }

      for (const page of ocr.pages) {
        for (const block of page.blocks) {
          const { vertices } = block.bounding_box
          context.beginPath()
          context.moveTo(x + vertices[0].x * scale, y + vertices[0].y * scale)
          context.lineTo(x + vertices[1].x * scale, y + vertices[1].y * scale)
          context.lineTo(x + vertices[2].x * scale, y + vertices[2].y * scale)
          context.lineTo(x + vertices[3].x * scale, y + vertices[3].y * scale)
          context.closePath()
          context.strokeStyle = 'rgba(173, 216, 230, 0.5)'
          context.lineWidth = 2
          context.stroke()
        }
      }
    }

    return () => {
      context.clearRect(0, 0, canvas.width, canvas.height)
    }
  }, [canvasRef, containerRef, imageUrl, containerSize, ocr])

  return (
    <div ref={containerRef} className="flex-grow relative">
      <canvas ref={canvasRef} className="w-full h-full absolute" />
    </div>
  )
}

export default BookPage
