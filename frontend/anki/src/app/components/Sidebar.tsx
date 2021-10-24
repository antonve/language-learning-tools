import classNames from 'classnames'
import { Word, WordCollection } from '@app/domain'

const Sidebar = ({
  activeId,
  words,
  updateActiveId,
  cleanWords,
}: {
  activeId: string | undefined
  words: WordCollection
  updateActiveId: (v: string) => void
  cleanWords: () => void
}) => {
  const showDelete = Object.keys(words).length > 0

  return (
    <ul className="pr-6">
      {Object.entries(words).map(([id, w]) => (
        <SidebarItem
          key={id}
          id={id}
          word={w}
          isActive={activeId === id}
          updateActiveId={updateActiveId}
        />
      ))}
      {showDelete && <CleanWordsLink onClick={cleanWords} />}
    </ul>
  )
}

const SidebarItem = ({
  id,
  word,
  isActive,
  updateActiveId,
}: {
  id: string
  word: Word
  isActive: boolean
  updateActiveId: (v: string) => void
}) => (
  <li className="mb-1">
    <a
      className={classNames(
        'px-2 -mx-2 py-1 transition duration-200 ease-in-out relative block font-medium',
        {
          'text-purple-600': isActive,
          'hover:translate-x-2px hover:text-gray-900 text-gray-600': !isActive,
        },
      )}
      onClick={e => {
        e.preventDefault()
        updateActiveId(id)
      }}
      href="#"
    >
      <span
        className={classNames('rounded absolute inset-0 bg-purple-200', {
          'opacity-25': isActive,
          'opacity-0': !isActive,
        })}
      ></span>
      <span
        className={classNames('relative', {
          'line-through opacity-40': word.done,
        })}
      >
        {word.value}
      </span>
    </a>
  </li>
)

const CleanWordsLink = ({ onClick }: { onClick: () => void }) => (
  <li className="mt-4 pt-3 border-t-2">
    <a
      className={classNames(
        'px-2 -mx-2 transition duration-200 ease-in-out relative block font-medium hover:translate-x-2px hover:opacity-70 text-red-700 uppercase text-xs',
      )}
      onClick={onClick}
      href="#"
    >
      <span className="relative">Clean up</span>
    </a>
  </li>
)

export default Sidebar
