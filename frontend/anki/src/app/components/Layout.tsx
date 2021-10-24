import { FC } from 'react'
import AddWordsButton from '@app/components/AddWordsButton'

interface Props {
  addWords: (words: string[]) => void
}

const Layout: FC<Props> = ({ children, addWords }) => (
  <div className="mb-8">
    <header
      className={`bg-grey-lightest border-t-4 border-purple-400 hero-background p-10 flex justify-between`}
    >
      <h1 className="text-gray-900 text-base no-underline hover:no-underline font-extrabold text-xl">
        Anki Miner
      </h1>
      <AddWordsButton addWords={addWords} />
    </header>
    <div className="px-10">{children}</div>
  </div>
)

export default Layout
