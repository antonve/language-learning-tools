import classNames from 'classnames'
import { Word, WordCollection } from 'src/lib/anki/domain'

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
  const doneCount = Object.values(words).filter(w => w.done).length

  return (
    <>
      {showDelete && (
        <CleanWordsLink
          onClick={cleanWords}
          count={doneCount}
          total={Object.entries(words).length}
        />
      )}
      <ul className="max-h-[600px] overflow-y-auto no-scrollbar">
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
    </>
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
        'px-2 py-1 transition duration-200 ease-in-out block font-medium rounded bg-purple-200',
        {
          'text-purple-600': isActive,
          'hover:translate-x-2px hover:text-gray-900 text-gray-600': !isActive,
          'bg-opacity-25': isActive,
          'bg-opacity-0': !isActive,
          'line-through': word.done,
        },
      )}
      onClick={e => {
        e.preventDefault()
        updateActiveId(id)
      }}
      href="#"
    >
      {word.value}
    </a>
  </li>
)

const CleanWordsLink = ({
  onClick,
  count,
  total,
}: {
  onClick: () => void
  count: number
  total: number
}) => (
  <div className="mb-4">
    <a
      className={classNames(
        'py-4 rounded transition duration-200 ease-in-out relative block font-medium hover:translate-x-2px hover:opacity-70 bg-red-100 text-red-800 text-center uppercase text-xs',
      )}
      onClick={onClick}
      href="#"
    >
      <span className="relative">
        Clean up ({count}/{total})
      </span>
    </a>
  </div>
)

export default Sidebar
