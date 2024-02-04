import { Tokens, getPosition } from '@app/mangareader/domain'
import classNames from 'classnames'
import { InitCardCreationFlow, PopupEditorProps } from './MangaReader'

export function Popup({
  tokens,
  parentSize,
  initCardCreationFlow,
  close,
  PopupEditor,
}: {
  tokens: Tokens | undefined
  parentSize: {
    width: number
    height: number
  }
  initCardCreationFlow: InitCardCreationFlow
  close: () => void
  PopupEditor: React.FC<PopupEditorProps>
}) {
  if (!tokens) {
    return null
  }

  const selectedTokens = Array.from(tokens.selectedIndices.keys())
    .sort()
    .map(i => tokens.list[i])

  if (selectedTokens.length === 0) {
    return null
  }

  const position = selectedTokens
    .map(it => it.bounding_poly.vertices)
    .reduce(
      (position, vertices) => {
        const { left, bottom, height } = getPosition(vertices)
        return {
          top: Math.max(position.top, bottom + height),
          left: Math.min(position.left, left),
        }
      },
      { top: 0, left: parentSize.width },
    )

  const selectedText = selectedTokens
    .map(it => it.description)
    .join(' ')
    .trim()
    .toLowerCase()

  const selectedTextCropArea = selectedTokens
    .map(it => getPosition(it.bounding_poly.vertices))
    .reduce(
      (prev, current) => {
        return {
          top: Math.min(prev.top, current.top),
          bottom: Math.max(prev.bottom, current.bottom),
          left: Math.min(prev.left, current.left),
          right: Math.max(prev.right, current.right),
        }
      },
      {
        top: parentSize.height,
        bottom: 0,
        left: parentSize.width,
        right: 0,
      },
    )

  return (
    <div
      className={classNames(
        'bg-white border-2 border-black absolute z-50 p-2 text-xl shadow-md rounded min-w-[300px]',
        {},
      )}
      style={{ left: `${position.left + 5}px`, top: `${position.top + 5}px` }}
      key={selectedText}
      onClick={e => {
        e.stopPropagation()
      }}
    >
      <PopupEditor
        defaultToken={selectedText}
        initCardCreationFlow={initCardCreationFlow}
        initialCropArea={selectedTextCropArea}
        close={close}
      />
    </div>
  )
}
