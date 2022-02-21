import { FC } from 'react'

interface Props {
  navigation?: () => any
}

const Layout: FC<Props> = ({ children, navigation }) => (
  <div className="mb-8">
    <header
      className={`bg-grey-lightest border-t-4 border-purple-400 hero-background p-10 flex justify-between`}
    >
      <h1 className="text-gray-900 text-base no-underline hover:no-underline font-extrabold text-xl">
        Anki Miner
      </h1>
      {navigation}
    </header>
    <div className="px-10">{children}</div>
  </div>
)

export default Layout
