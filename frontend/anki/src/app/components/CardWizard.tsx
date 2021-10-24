import { useEffect } from 'react'

import { Word, Sentence } from '@app/domain'
import { useSentences, useEnglishDefition } from '@app/hooks'
import Button from '@app/components/Button'
import { TextInput, TextArea, Label } from '@app/components/Form'
import SentenceList from '@app/components/SentenceList'

const CardWizard = ({
  word,
  id,
  updateWord,
}: {
  word: Word | undefined
  id: string | undefined
  updateWord: (newWord: Word, id: string) => void
}) => {
  const { definition: definitionEn } = useEnglishDefition(word?.value)
  const { sentences } = useSentences(word?.value)

  useEffect(() => {
    if (
      word?.meta.definitionEnglish === undefined &&
      id !== undefined &&
      word !== undefined &&
      word
    ) {
      const newWord: Word = { ...word }
      newWord.meta.definitionEnglish = definitionEn
      updateWord(newWord, id)
    }
  }, [definitionEn, id])

  if (word === undefined || id === undefined) {
    return <div className="px-8 py-6 w-1/2">Select a word to add</div>
  }

  return (
    <div className="flex rounded overflow-hidden items-stretch">
      <div className="px-8 py-6 w-1/2">
        <h2 className="text-2xl font-bold mb-4">{word.value}</h2>
        <form>
          <div className="mb-4">
            <Label htmlFor="sentence">Sentence</Label>
            <TextArea
              id="sentence"
              rows={4}
              value={word.meta?.sentence?.line ?? ''}
              onChange={(newLine: string) => {
                const newWord: Word = { ...word }
                if (newWord.meta.sentence === undefined) {
                  newWord.meta.sentence = {
                    line: '',
                    filename: undefined,
                    series: undefined,
                    chapter: undefined,
                    original: undefined,
                  }
                }

                newWord.meta.sentence.line = newLine
                updateWord(newWord, id)
              }}
            />
          </div>
          <div className="mb-6">
            <Label htmlFor="reading">Reading</Label>
            <TextInput id="reading" value={word.meta.reading} />
          </div>
          <div className="mb-6">
            <Label htmlFor="def_jp">Definition Japanese</Label>
            <TextArea
              id="def_jp"
              value={word.meta.definitionJapanese}
              rows={6}
              onChange={(newDefinition: string) => {
                const newWord: Word = { ...word }
                newWord.meta.definitionJapanese = newDefinition
                updateWord(newWord, id)
              }}
            />
          </div>
          <div className="mb-6">
            <Label htmlFor="def_en">Definition English</Label>
            <TextArea
              id="def_en"
              value={word.meta.definitionEnglish}
              rows={6}
              onChange={(newDefinition: string) => {
                const newWord: Word = { ...word }
                newWord.meta.definitionEnglish = newDefinition
                updateWord(newWord, id)
              }}
            />
          </div>

          <div className="flex items-center justify-between">
            <Button primary>Export</Button>
            <Button>Mark as Done</Button>
          </div>
        </form>
      </div>
      <div className="bg-gray-200 w-1/2 px-8 py-6">
        <h2 className="text-xl font-bold mb-4">Example sentences</h2>
        <SentenceList
          sentences={sentences}
          activeSentence={word.meta.sentence}
          onSelect={(sentence: Sentence) => {
            const newWord: Word = {
              ...word,
              meta: {
                reading: word.meta.reading,
                definitionEnglish: word.meta.definitionEnglish,
                definitionJapanese: word.meta.definitionJapanese,
                vocabCard: word.meta.vocabCard ?? false,
                sentence: { ...sentence },
              },
            }
            updateWord(newWord, id)
          }}
        />
      </div>
    </div>
  )
}

export default CardWizard
