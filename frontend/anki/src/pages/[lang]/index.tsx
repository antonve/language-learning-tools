import type { NextPage } from 'next'
import { Tab } from '@headlessui/react'

import Layout from '@app/components/Layout'
import Sidebar from '@app/components/Sidebar'
import CardWizardJapanese from '@app/components/CardWizardJapanese'
import { useWordCollection } from '@app/hooks'
import AddWordsButton from '@app/components/AddWordsButton'
import LanguageToggle from '@app/components/LanguageToggle'
import { useState } from 'react'
import { availableLanguages } from '@app/domain'

const Home: NextPage = () => {
  const {
    words,
    updateWord,
    deleteWord,
    addWords,
    cleanWords,
    selectedWordId,
    setSelectedWordId,
  } = useWordCollection()

  return (
    <Tab.Group>
      <Layout
        navigation={() => (
          <>
            <LanguageToggle languages={availableLanguages} />
            {addWords && <AddWordsButton addWords={addWords} />}
          </>
        )}
      >
        <Tab.Panels>
          <Tab.Panel>
            <div className="flex">
              <div className="w-1/6">
                <Sidebar
                  activeId={selectedWordId}
                  updateActiveId={setSelectedWordId}
                  words={words}
                  cleanWords={cleanWords}
                />
              </div>
              <div className="w-full rounded-sm">
                <CardWizardJapanese
                  words={words}
                  id={selectedWordId}
                  updateWord={updateWord}
                  deleteWord={deleteWord}
                />
              </div>
            </div>
          </Tab.Panel>
          <Tab.Panel>test</Tab.Panel>
        </Tab.Panels>
      </Layout>
    </Tab.Group>
  )
}

export default Home
