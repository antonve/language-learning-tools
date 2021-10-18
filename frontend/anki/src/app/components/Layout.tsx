import {FC} from 'react'
import Button from '@app/components/Button'

const Layout: FC<{}> = ({children}) => (
  <div>
    <header
      className={`bg-grey-lightest border-t-4 border-purple-400 hero-background p-10`}
    >
      <h1 className="text-gray-900 text-base no-underline hover:no-underline font-extrabold text-xl">
        Anki Miner
      </h1>
      <Button>Add Words</Button>
    </header>
    <div className="px-10">{children}</div>
  </div>
)

export default Layout
