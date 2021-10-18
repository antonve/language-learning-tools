import classNames from 'classnames'
import { Word, WordCollection } from '@app/domain'

const Sidebar = ({
  activeId,
  words,
  updateActiveId,
}: {
  activeId: string
  words: WordCollection
  updateActiveId: (v: string) => void
}) => {
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
      <span className="relative">{word.value}</span>
    </a>
  </li>
)

export default Sidebar
