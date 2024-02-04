import { Tokens, getPosition } from '@app/mangareader/domain'
import classNames from 'classnames'

export function TokenOverlays({
  tokens,
  useVertical,
  selectIndex,
}: {
  tokens: Tokens | undefined
  useVertical: boolean
  selectIndex: (i: number) => void
}) {
  if (!tokens) {
    return null
  }

  return (
    <>
      {tokens.list.map((token, i) => {
        const { vertices } = token.bounding_poly
        const { top, left, height, width } = getPosition(vertices)
        const isSelected = tokens.selectedIndices.has(i)

        return (
          <div
            key={i}
            className={classNames(
              'absolute z-30 block font-bold cursor-pointer',
              {
                'bg-green-500/10': isSelected,
                '': !isSelected,
              },
            )}
            style={{
              top: `${top}px`,
              left: `${left}px`,
              height: `${height}px`,
              width: `${width}px`,
              fontSize: useVertical ? `${width}px` : `${height}px`,
              lineHeight: '1',
              fontFamily: '"Comic Neue", cursive',
              writingMode: useVertical ? 'vertical-rl' : 'horizontal-tb',
            }}
            onClick={e => {
              e.stopPropagation()
              selectIndex(i)
            }}
          ></div>
        )
      })}
    </>
  )
}
