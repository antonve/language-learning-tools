import type { NextPage } from 'next'
import Reader from '../src/Reader'

const Home: NextPage<{}> = () => {
  return (
    <div className="mb-8 bg-gray-900 h-screen">
      <header className={`border-t-4 border-pink-400 p-4 flex justify-between`}>
        <h1 className="text-gray-100 text-base no-underline hover:no-underline font-extrabold text-xl">
          Chinese OCR
        </h1>
      </header>
      <div className="px-10">
        <Reader book={undefined} />
      </div>
    </div>
  )
}

export default Home
