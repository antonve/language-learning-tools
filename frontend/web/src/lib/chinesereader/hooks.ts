import { useEffect, useRef, useState } from 'react'

export const useKeyPress = (targetKey: string, onPressHandler: () => void) => {
  useEffect(() => {
    const onKeyDown = ({ key }: KeyboardEvent) => {
      if (key == targetKey) {
        onPressHandler()
      }
    }

    window.addEventListener('keydown', onKeyDown)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [targetKey, onPressHandler])
}

export const useWindowSize = (ref: HTMLDivElement | null) => {
  const [size, setSize] = useState({
    width: 0,
    height: 0,
  })

  useEffect(() => {
    if (!ref) {
      return
    }

    function handleResize() {
      setSize({
        width: ref?.offsetWidth ?? 0,
        height: ref?.offsetHeight ?? 0,
      })
    }

    window.addEventListener('resize', handleResize)
    handleResize()

    return () => window.removeEventListener('resize', handleResize)
  }, [ref])

  return size
}

export function useTextSelection() {
  // we need a reference to the element wrapping the text in order to determine
  // if the selection is the selection we are after
  const ref = useRef()

  // we store info about the current Range here
  const [range, setRange] = useState<Range>()

  // In this effect we're registering for the documents "selectionchange" event
  useEffect(() => {
    function handleChange() {
      // get selection information from the browser
      const selection = window.getSelection()

      // we only want to proceed when we have a valid selection
      if (
        !selection ||
        selection.isCollapsed ||
        (ref.current && !selection.containsNode(ref.current, true))
      ) {
        setRange(undefined)
        return
      }

      setRange(selection.getRangeAt(0))
    }

    document.addEventListener('selectionchange', handleChange)
    return () => document.removeEventListener('selectionchange', handleChange)
  }, [])

  return { range, ref }
}
