import { useEffect, useState } from 'react'
import { useTransformContext } from 'react-zoom-pan-pinch'
import { Position } from './MangaReader'

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

export function Cropper({
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
      onTouchCancel={() => setMoveMode('idle')}
      onTouchMove={e => {
        e.stopPropagation()
        if (moveMode === 'idle') {
          return
        }

        let newPos = { ...position }
        const bounds = e.currentTarget.getBoundingClientRect()

        const touch = e.touches[0]
        if (!touch) {
          return
        }

        switch (moveMode) {
          case 'move':
            const width = position.right - position.left
            const height = position.bottom - position.top

            newPos.left = touch.pageX / scale
            newPos.top = touch.pageY / scale
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
            newPos.left = (touch.pageX - bounds.left) / scale
            newPos.top = (touch.pageY - bounds.top) / scale

            // Clamp to page size
            newPos.left = clamp(newPos.left, [0, newPos.right - 10])
            newPos.top = clamp(newPos.top, [0, newPos.bottom - 10])
            break
          case 'resize-ne':
            newPos.right = (touch.pageX - bounds.left) / scale
            newPos.top = (touch.pageY - bounds.top) / scale

            // Clamp to page size
            newPos.right = clamp(newPos.right, [
              newPos.left + 10,
              parentSize.width / scale,
            ])
            newPos.top = clamp(newPos.top, [0, newPos.bottom - 10])
            break
          case 'resize-se':
            newPos.right = (touch.pageX - bounds.left) / scale
            newPos.bottom = (touch.pageY - bounds.top) / scale

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
            newPos.left = (touch.pageX - bounds.left) / scale
            newPos.bottom = (touch.pageY - bounds.top) / scale

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
      onTouchEnd={() => setMoveMode('idle')}
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
        onTouchStart={e => {
          e.stopPropagation()
          setMoveMode('move')
        }}
        onClick={e => {
          e.stopPropagation()
        }}
      >
        <div
          className="w-10 h-10 bg-white border border-black absolute -top-7 -left-7 cursor-nwse-resize"
          onMouseDown={e => {
            e.stopPropagation()
            setMoveMode('resize-nw')
          }}
          onTouchStart={e => {
            e.stopPropagation()
            setMoveMode('resize-nw')
          }}
        ></div>
        <div
          className="w-10 h-10 bg-white border border-black absolute -top-7 -right-7 cursor-nesw-resize"
          onMouseDown={e => {
            e.stopPropagation()
            setMoveMode('resize-ne')
          }}
          onTouchStart={e => {
            e.stopPropagation()
            setMoveMode('resize-ne')
          }}
        ></div>
        <div
          className="w-10 h-10 bg-white border border-black absolute -bottom-7 -right-7 cursor-nwse-resize"
          onMouseDown={e => {
            e.stopPropagation()
            setMoveMode('resize-se')
          }}
          onTouchStart={e => {
            e.stopPropagation()
            setMoveMode('resize-se')
          }}
        ></div>
        <div
          className="w-10 h-10 bg-white border border-black absolute -bottom-7 -left-7 cursor-nesw-resize"
          onMouseDown={e => {
            e.stopPropagation()
            setMoveMode('resize-sw')
          }}
          onTouchStart={e => {
            e.stopPropagation()
            setMoveMode('resize-sw')
          }}
        ></div>
      </div>
    </div>
  )
}
