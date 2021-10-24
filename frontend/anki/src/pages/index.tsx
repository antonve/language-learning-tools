import type { NextPage } from 'next'

import Layout from '@app/components/Layout'
import Sidebar from '@app/components/Sidebar'
import CardWizard from '@app/components/CardWizard'
import { useWordCollection } from '@app/hooks'

const Home: NextPage = () => {
  const {
    words,
    updateWord,
    deleteWord,
    addWords,
    selectedWordId,
    setSelectedWordId,
  } = useWordCollection()

  if (
    words === undefined ||
    Object.keys(words).length === 0 ||
    selectedWordId === undefined
  ) {
    return <>Add some words first.</>
  }

  return (
    <Layout addWords={addWords}>
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
            deleteWord={deleteWord}
          />
        </div>
      </div>
    </Layout>
  )
}

export default Home
