import { useEffect } from 'react'

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
