import type { NextPage } from 'next'

import Layout from '@app/Layout'
import Sidebar from '@app/anki/components/Sidebar'
import CardWizard from '@app/anki/components/ja/CardWizard'
import { useWordCollection } from '@app/anki/hooks'
import AddWordsButton from '@app/anki/components/AddWordsButton'
import LanguageToggle from '@app/anki/components/LanguageToggle'
import { availableLanguages } from '@app/anki/domain'

const JapaneseApp: NextPage = () => {
  const language = availableLanguages['ja']
  const {
    words,
    updateWord,
    deleteWord,
    addWords,
    cleanWords,
    selectedWordId,
    setSelectedWordId,
  } = useWordCollection(language.code)

  return (
    <Layout
      navigation={() => (
        <>
          <h1 className="text-gray-900 text-base no-underline hover:no-underline font-extrabold text-xl">
            Anki Miner
          </h1>
          <LanguageToggle
            languages={Object.values(availableLanguages)}
            selectedLanguageCode={language.code}
          />
          {addWords && (
            <AddWordsButton addWords={addWords} language={language} />
          )}
        </>
      )}
    >
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
          <CardWizard
            words={words}
            id={selectedWordId}
            updateWord={updateWord}
            deleteWord={deleteWord}
          />
        </div>
      </div>
    </Layout>
  )
}

export default JapaneseApp
