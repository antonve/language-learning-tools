import classNames from 'classnames'
import { Word } from '@app/domain'

const Sidebar = ({
  activeId,
  words,
  updateActiveId,
}: {
  activeId: number
  words: Word[]
  updateActiveId: (v: number) => void
}) => {
  return (
    <ul className="pr-6">
      {words.map(w => (
        <SidebarItem
          key={w.id}
          word={w}
          isActive={activeId === w.id}
          updateActiveId={updateActiveId}
        />
      ))}
    </ul>
  )
}

const SidebarItem = ({
  word,
  isActive,
  updateActiveId,
}: {
  word: Word
  isActive: boolean
  updateActiveId: (v: number) => void
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
        updateActiveId(word.id)
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
