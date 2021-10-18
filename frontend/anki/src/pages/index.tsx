import { useState } from 'react'
import type { NextPage } from 'next'
import classNames from 'classnames'

import Layout from '@app/components/Layout'
import Sidebar from '@app/components/Sidebar'
import CardWizard from '@app/components/CardWizard'

const Home: NextPage = () => {
  const words = [
    { id: 1, value: '手が回らない', done: true },
    { id: 2, value: '足を運んで', done: true },
    { id: 3, value: '不甲斐ない', done: true },
    { id: 4, value: 'おろおろ', done: true },
    { id: 5, value: '旅の恥はかき捨て', done: false },
    { id: 6, value: '憤懣', done: false },
    { id: 7, value: '溜飲', done: false },
    { id: 8, value: '翻弄', done: false },
  ]

  const [selectedWordId, setSelectedWordId] = useState(3)

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
          <CardWizard word={words[selectedWordId]} />
        </div>
      </div>
    </Layout>
  )
}

export default Home
