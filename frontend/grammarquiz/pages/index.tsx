import { useState, Fragment } from 'react'
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

const useQuestion = (questions: Question[]) => {
  const [question, setQuestion] = useState(() => randomValue(questions))
  const answers = {
    1: question.a,
    2: question.b,
    3: question.c,
    4: question.d,
  }

  return {
    question: question.sentence,
    answers,
    check: (answer: number) => answer.toString() === question.answer,
    next: () => {
      setQuestion(randomValue(questions))
    },
  }
}

const randomValue = <T extends unknown>(arr: T[]): T => {
  return arr[Math.floor(Math.random() * arr.length)]
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
      <div className="px-10">
        <Question questions={questions} />
      </div>
    </div>
  )
}

const Question = ({ questions }: { questions: Question[] }) => {
  const { question, answers, check, next } = useQuestion(questions)

  return (
    <div>
      <div className="w-100 bg-gray-800 rounded-xl p-8 text-gray-300 text-4xl leading-relaxed">
        <QuestionView sentence={question} />
      </div>
    </div>
  )
}

const QuestionView = ({ sentence }: { sentence: string }) => {
  const parts = sentence.split('＊')

  return (
    <>
      {parts.map((str, i) => (
        <Fragment key={i}>
          {str}
          {i < parts.length - 1 && (
            <span className="opacity-50 bg-blue-300 py-0 w-24 mx-4 rounded-lg inline-block leading-none">
              &nbsp;
            </span>
          )}
        </Fragment>
      ))}
    </>
  )
}

Home.getInitialProps = async ({ req }) => {
  const raw = new Buffer(publicRuntimeConfig.questions, 'base64')
  const questions = JSON.parse(raw.toString())

  return { questions }
}

export default Home
