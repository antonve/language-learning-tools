import type { NextPage } from 'next'

import Layout from '@app/Layout'
import Sidebar from '@app/anki/components/Sidebar'
import { useWordCollection } from '@app/anki/hooks'
import AddWordsButton from '@app/anki/components/AddWordsButton'
import LanguageToggle from '@app/anki/components/LanguageToggle'
import { availableLanguages, formatDefinitions } from '@app/anki/domain'
import CardWizard from '@app/anki/components/zh/CardWizard'
import Button from '../Button'
import { getPendingCards } from '@app/anki/api'

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
          <h1 className="text-gray-900 no-underline hover:no-underline font-extrabold text-xl">
            Anki Miner
          </h1>
          <LanguageToggle
            languages={Object.values(availableLanguages)}
            selectedLanguageCode={language.code}
          />
          {addWords && (
            <div className="space-x-4">
              <AddWordsButton addWords={addWords} language={language} />
              <Button
                onClick={async () => {
                  const res = await getPendingCards('zho')
                  const words = res.cards.map(c => ({
                    value: c.token,
                    done: false,
                    meta: {
                      sentence: {
                        language: 'zh',
                        series: undefined,
                        filename: undefined,
                        chapter: undefined,
                        line: c.meta.sentence,
                        original: c.meta.sentence,
                      },
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
        <div className="w-1/6 mr-4">
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
