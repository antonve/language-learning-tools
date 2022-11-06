import { FC } from 'react'

interface Props {
  navigation?: () => any
}

const Layout: FC<Props> = ({ children, navigation }) => (
  <div className="mb-8">
    <div className="flex bg-gray-100">
      <NavLink href="/anki">Anki Miner</NavLink>
      <NavLink href="/manga-reader">Manga Reader</NavLink>
      <NavLink href="/text-reader">Text Reader</NavLink>
    </div>
    <header
      className={`bg-grey-lightest hero-background p-10 flex justify-between`}
    >
      {navigation && navigation()}
    </header>
    <div className="px-10">{children}</div>
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
