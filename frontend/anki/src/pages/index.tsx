import { useState } from 'react'
import type { NextPage } from 'next'

import Layout from '@app/components/Layout'
import Sidebar from '@app/components/Sidebar'
import CardWizard from '@app/components/CardWizard'
import { Word, WordCollection } from '@app/domain'

const Home: NextPage = () => {
  const [words, setWords] = useState({
    '33935dba-b20f-4fd6-9d9e-80c7f2309aea': {
      value: '手が回らない',
      done: true,
      meta: undefined,
    },
    '5ef77e40-1a26-43fc-a58b-7c9012d710ef': {
      value: '足を運んで',
      done: true,
      meta: undefined,
    },
    'b5b16715-7bdc-4093-8215-4ccba33d48c4': {
      value: '不甲斐ない',
      done: true,
      meta: undefined,
    },
    'ccf31c8e-3df9-4f2f-9221-f6a753961c6b': {
      value: 'おろおろ',
      done: true,
      meta: undefined,
    },
    '4a433e60-dcbb-4549-aec0-6d9102199957': {
      value: '旅の恥はかき捨て',
      done: false,
      meta: undefined,
    },
    '5a4305c0-8491-433c-af2e-bef517c2b6a7': {
      value: '憤懣',
      done: false,
      meta: undefined,
    },
    'abe45caa-3f87-4b7d-b5df-7f3e09c90032': {
      value: '溜飲',
      done: false,
      meta: undefined,
    },
    '724c1b68-2971-4a78-a755-b829de022ef5': {
      value: '翻弄',
      done: false,
      meta: undefined,
    },
  } as WordCollection)

  const [selectedWordId, setSelectedWordId] = useState(
    Object.keys(words)[0] as string,
  )

  const updateWord = (newWord: Word, id: string) => {
    if (words[id] === undefined) {
      return
    }

    setWords({ ...words, [id]: newWord })
  }

  return (
    <Layout>
      <div className="flex">
        <div className="h-12 w-1/6">
          <Sidebar
            activeId={selectedWordId}
            updateActiveId={setSelectedWordId}
            words={words}
          />
        </div>
        <div className="bg-gray-50 w-full rounded-sm">
          <CardWizard
            word={words?.[selectedWordId]}
            id={selectedWordId}
            updateWord={updateWord}
          />
        </div>
      </div>
    </Layout>
  )
}

export default Home
