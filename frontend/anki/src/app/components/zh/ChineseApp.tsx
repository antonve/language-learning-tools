import type { NextPage } from 'next'

import Layout from '@app/components/Layout'
import Sidebar from '@app/components/Sidebar'
import { useWordCollection } from '@app/hooks'
import AddWordsButton from '@app/components/AddWordsButton'
import LanguageToggle from '@app/components/LanguageToggle'
import { availableLanguages, formatDefinitions } from '@app/domain'
import CardWizard from '@app/components/zh/CardWizard'
import Button from '../Button'
import { getPendingCards } from './api'

const ChineseApp: NextPage = () => {
  const language = availableLanguages['zh']
  const {
    words,
    updateWord,
    deleteWord,
    addWords,
    importWords,
    cleanWords,
    selectedWordId,
    setSelectedWordId,
  } = useWordCollection(language.code)

  return (
    <Layout
      navigation={() => (
        <>
          <LanguageToggle
            languages={Object.values(availableLanguages)}
            selectedLanguageCode={language.code}
          />
          {addWords && (
            <div className="space-x-4">
              <AddWordsButton addWords={addWords} language={language} />
              <Button
                onClick={async () => {
                  const res = await getPendingCards()
                  const words = res.cards.map(c => ({
                    value: c.token,
                    done: false,
                    meta: {
                      sentence: undefined,
                      reading: c.meta.pinyin_tones,
                      zhuyin: undefined,
                      definitionEnglish: formatDefinitions(
                        c.meta.meanings.map(m => ({ meaning: m })),
                      ),
                      definitionTargetLanguage: undefined,
                      vocabCard: c.meta.card_type === 'vocab',
                      highlight: c.token,
                      externalId: c.id,
                    },
                  }))
                  importWords(words)
                }}
              >
                Import words
              </Button>
            </div>
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

export default ChineseApp
