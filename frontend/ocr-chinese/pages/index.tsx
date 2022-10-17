import type { NextPage } from 'next'
import Reader from '../src/Reader'

const Home: NextPage<{}> = () => {
  return (
    <div className="bg-gray-900 h-screen w-screen flex flex-col">
      <header
        className={`border-t-4 border-pink-400 p-4 justify-between box-border`}
      >
        <h1 className="text-gray-100 text-base no-underline hover:no-underline font-extrabold text-xl">
          Chinese OCR
        </h1>
      </header>
      <div className="flex bg-white flex-grow">
        <Reader />
      </div>
    </div>
  )
}

export default Home
