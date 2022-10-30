import type { NextPage } from 'next'

import Layout from '@app/components/Layout'
import Sidebar from '@app/components/Sidebar'
import { useWordCollection } from '@app/hooks'
import AddWordsButton from '@app/components/AddWordsButton'
import LanguageToggle from '@app/components/LanguageToggle'
import { availableLanguages } from '@app/domain'

const ChineseApp: NextPage = () => {
  const languageCode = 'zh'
  const {
    words,
    updateWord,
    deleteWord,
    addWords,
    cleanWords,
    selectedWordId,
    setSelectedWordId,
  } = useWordCollection(languageCode)

  return (
    <Layout
      navigation={() => (
        <>
          <LanguageToggle
            languages={availableLanguages}
            selectedLanguageCode={languageCode}
          />
          {addWords && <AddWordsButton addWords={addWords} />}
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
        <div className="w-full rounded-sm"></div>
      </div>
    </Layout>
  )
}

export default ChineseApp
