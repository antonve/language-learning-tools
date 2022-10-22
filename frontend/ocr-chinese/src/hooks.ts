import { useEffect, useState } from 'react'

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
