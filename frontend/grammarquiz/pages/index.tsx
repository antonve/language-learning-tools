import type { NextPage } from 'next'
import getConfig from 'next/config'

const { publicRuntimeConfig } = getConfig()

interface Question {
  sentence: string
  a: string
  b: string
  c: string
  d: string
  answer: string
  source: string
  id: string
}

interface Props {
  questions: Question[]
}

const Home: NextPage<Props> = ({ questions }) => {
  return (
    <div className="mb-8 bg-gray-900 h-screen">
      <header
        className={`border-t-4 border-yellow-400 p-10 flex justify-between`}
      >
        <h1 className="text-gray-100 text-base no-underline hover:no-underline font-extrabold text-xl">
          Grammar Quiz
        </h1>
      </header>
      <div className="px-10"></div>
    </div>
  )
}

Home.getInitialProps = async ({ req }) => {
  const raw = new Buffer(publicRuntimeConfig.questions, 'base64')
  const questions = JSON.parse(raw.toString())

  return { questions }
}

export default Home
