import { FC } from 'react'

interface Props {
  navigation?: () => any
  bodyClassName?: string
}

const Layout: FC<Props> = ({
  children,
  navigation,
  bodyClassName = 'px-10',
}) => (
  <div>
    <div className="flex bg-gray-100 absolute">
      <NavLink href="/anki/ja">Anki Miner</NavLink>
      <NavLink href="/chinese-manga-reader">Chinese Manga Reader</NavLink>
      <NavLink href="/chinese-text-reader">Chinese Text Reader</NavLink>
    </div>
    {navigation && (
      <header
        className={`bg-grey-lightest hero-background p-10 flex justify-between`}
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

export default Layout
