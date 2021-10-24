import { useEffect } from 'react'

import { Word, Sentence, dictionaries } from '@app/domain'
import {
  useSentences,
  useEnglishDefition,
  useJapaneseDefition,
} from '@app/hooks'
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
  const { definition: english } = useEnglishDefition(word?.value)
  const { definition: japanese } = useJapaneseDefition(word?.value)
  const { sentences } = useSentences(word?.value)

  useEffect(() => {
    if (
      english === undefined ||
      id === undefined ||
      word === undefined ||
      word.meta.definitionEnglish !== undefined ||
      word.value !== english?.word ||
      english.finished === false
    ) {
      return
    }

    const newWord: Word = { ...word }
    newWord.meta.definitionEnglish = english.definition
    updateWord(newWord, id)
  }, [english, id])

  useEffect(() => {
    if (
      japanese === undefined ||
      id === undefined ||
      word === undefined ||
      word.meta.definitionJapanese !== undefined ||
      word.meta.reading !== undefined ||
      word.value !== japanese?.word ||
      japanese.finished === false
    ) {
      return
    }

    const newWord: Word = { ...word }
    newWord.meta.definitionJapanese = japanese.definition
    newWord.meta.reading = japanese.reading
    updateWord(newWord, id)
  }, [japanese, id])

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
            <TextInput
              id="reading"
              value={word.meta.reading}
              onChange={(newReading: string) => {
                const newWord: Word = { ...word }
                newWord.meta.reading = newReading
                updateWord(newWord, id)
              }}
            />
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
            <Button
              onClick={() => {
                const newWord: Word = { ...word }
                newWord.done = !word.done
                updateWord(newWord, id)
              }}
            >
              Mark as {word.done ? 'WIP' : 'Done'}
            </Button>
          </div>
        </form>
      </div>
      <div className="bg-gray-200 w-1/2 px-8 py-6">
        <h2 className="text-xl font-bold mb-4">Dictionaries</h2>
        <div>
          <ul className="flex -mx-2">
            {dictionaries.map(d => (
              <li className="mx-2" key={d.name}>
                <a
                  href={d.url(word.value)}
                  target="_blank"
                  className="font-bold py-1 px-4 rounded border-2 block border-gray-800 text-gray-800 hover:opacity-50 transition duration-200 ease-in-out"
                >
                  {d.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <h2 className="text-xl font-bold my-4">Example sentences</h2>
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
