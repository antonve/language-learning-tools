import classnames from 'classnames'
import { FC, ReactNode } from 'react'

interface Props {
  navigation?: () => any
  bodyClassName?: string
  headerClassName?: string
  darkMode?: boolean
}

const Layout: FC<Props> = ({
  children,
  navigation,
  bodyClassName = 'px-10',
  headerClassName = '',
  darkMode = false,
}) => (
  <div
    className={classnames(
      {
        'dark bg-gray-800 text-gray-200': darkMode,
      },
      'min-h-screen flex flex-col',
    )}
  >
    <div className="flex bg-gray-100 absolute dark:bg-gray-900">
      <NavLink href="/anki/ja">Anki Miner</NavLink>
      <NavLink href="/mined-words">Mined Words</NavLink>
      <NavLink href="/chinese-reader/manga">ZH Manga</NavLink>
      <NavLink href="/chinese-reader/">ZH Text</NavLink>
      <NavLink href="/german-reader/manga">DE Manga</NavLink>
    </div>
    {navigation && (
      <header
        className={`hero-background m-10 flex justify-between items-center ${headerClassName}`}
      >
        {navigation()}
      </header>
    )}
    <div className={bodyClassName}>{children}</div>
  </div>
)

const NavLink = ({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) => (
  <a
    href={href}
    className="px-6 py-1 font-semibold text-xs hover:bg-gray-600 hover:text-white"
  >
    {children}
  </a>
)

export const PageTitle = ({ children }: { children?: ReactNode }) => (
  <h1 className="text-gray-900 text-base no-underline hover:no-underline font-extrabold text-xl dark:text-gray-100 capitalize">
    {children}
  </h1>
)

export default Layout
