import classNames from 'classnames'

const Sidebar = ({ activeId }: { activeId: number }) => {
  const words = [
    { id: 1, value: '手が回らない', done: true },
    { id: 2, value: '足を運んで', done: true },
    { id: 3, value: '不甲斐ない', done: true },
    { id: 4, value: 'おろおろ', done: true },
    { id: 5, value: '旅の恥はかき捨て', done: false },
    { id: 6, value: '憤懣', done: false },
    { id: 7, value: '溜飲', done: false },
    { id: 8, value: '翻弄', done: false },
  ]

  return (
    <ul className="pr-6">
      {words.map(w => (
        <SidebarItem key={w.id} word={w} isActive={activeId === w.id} />
      ))}
    </ul>
  )
}

const SidebarItem = ({
  word,
  isActive,
}: {
  word: { id: number; value: string; done: boolean }
  isActive: boolean
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
