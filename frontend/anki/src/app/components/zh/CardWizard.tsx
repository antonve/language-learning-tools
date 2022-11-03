import { useEffect, useMemo } from 'react'

import { Word, Sentence, WordCollection } from '@app/domain'
import { useSentences } from '@app/hooks'
import Button from '@app/components/Button'
import {
  TextInput,
  TextArea,
  Label,
  Checkbox,
  TitleInput,
} from '@app/components/Form'
import SentenceList from '@app/components/SentenceList'
import { addAnkiNote } from '@app/api'
import {
  dictionaries,
  exportRequestForWord,
  useChineseDefinition,
  useEnglishDefinition,
} from '@app/components/zh'
import { markCardAsExported } from './api'

const CardWizard = ({
  words,
  id,
  updateWord,
  deleteWord,
}: {
  words: WordCollection
  id: string | undefined
  updateWord: (newWord: Word, id: string, selectedWordId?: string) => void
  deleteWord: (id: string) => void
}) => {
  const word = words?.[id ?? 'none']

  const { definition: english } = useEnglishDefinition(word?.value)
  const { definition: chinese } = useChineseDefinition(word?.value)
  const { sentences } = useSentences('zh', word)

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
    if (word.meta.reading === undefined) {
      newWord.meta.reading = english.pinyin.pretty
    }
    updateWord(newWord, id)
  }, [english, id])

  useEffect(() => {
    if (
      chinese === undefined ||
      id === undefined ||
      word === undefined ||
      word.meta.definitionTargetLanguage !== undefined ||
      word.value !== chinese?.word ||
      chinese.finished === false
    ) {
      return
    }

    const newWord: Word = { ...word }
    newWord.meta.definitionTargetLanguage = chinese.definition
    newWord.meta.audioUrl = chinese.audioUrl
    if (chinese.pinyin) {
      newWord.meta.reading = chinese.pinyin
    }
    newWord.meta.zhuyin = chinese.zhuyin
    updateWord(newWord, id)
  }, [chinese, id])

  if (word === undefined || id === undefined) {
    return <div className="px-8 py-6 w-1/2">Select a word to add</div>
  }

  const exportNote = async (e: Event) => {
    e.preventDefault()

    try {
      await addAnkiNote(exportRequestForWord(word))

      const ids = Object.entries(words)
        .filter(([_, word]) => !word.done)
        .map(([id, _]) => id)
      const nextIndex = ids.indexOf(id) + 1

      const newWord: Word = { ...word }
      newWord.done = true
      updateWord(newWord, id, ids[nextIndex])

      if (word.meta.externalId) {
        markCardAsExported(word.meta.externalId)
      }
    } catch (e) {
      window.alert(e)
    }
  }

  return (
    <div className="flex rounded overflow-hidden items-stretch divide-x-2 divide-black divide-opacity-10">
      <div className="bg-gray-100 px-8 py-6 w-1/2">
        <div className="flex justify-between items-start">
          <TitleInput
            value={word.value}
            id="title"
            onChange={(value: string) => {
              const newWord: Word = { ...word }
              newWord.value = value
              newWord.meta.highlight = value
              updateWord(newWord, id)
            }}
          />
          <button
            onClick={() => {
              if (window.confirm('Are you sure?')) {
                deleteWord(id)
              }
            }}
            className="text-sm text-red-700 font-bold uppercase py-1 hover:opacity-70"
          >
            Delete
          </button>
        </div>
        <form onSubmit={exportNote}>
          <div className="mb-2">
            <Label htmlFor="sentence">Sentence</Label>
            <TextArea
              id="sentence"
              rows={2}
              value={word.meta?.sentence?.line ?? ''}
              onChange={(newLine: string) => {
                const newWord: Word = { ...word }
                if (newWord.meta.sentence === undefined) {
                  newWord.meta.sentence = {
                    language: 'zh',
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
          <div className="mb-2">
            <Label htmlFor="highlight">Highlight</Label>
            <TextInput
              id="highlight"
              value={word.meta.highlight}
              onChange={(value: string) => {
                const newWord: Word = { ...word }
                newWord.meta.highlight = value
                updateWord(newWord, id)
              }}
            />
          </div>
          <div className="flex space-x-2 w-full">
            <div className="mb-2 flex-grow">
              <Label htmlFor="reading">Pinyin</Label>
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
            <div className="mb-2 flex-grow">
              <Label htmlFor="reading">Zhuyin</Label>
              <TextInput
                id="reading"
                value={word.meta.zhuyin}
                onChange={(newReading: string) => {
                  const newWord: Word = { ...word }
                  newWord.meta.zhuyin = newReading
                  updateWord(newWord, id)
                }}
              />
            </div>
            {word.meta.audioUrl && (
              <div className="mb-2">
                <Label htmlFor="audio">Audio</Label>
                <div>
                  <AudioPlayer url={word.meta.audioUrl} />
                </div>
              </div>
            )}
          </div>
          <div className="mb-2">
            <Label htmlFor="def_zh">Definition Chinese</Label>
            <TextArea
              id="def_zh"
              value={word.meta.definitionTargetLanguage}
              rows={5}
              onChange={(newDefinition: string) => {
                const newWord: Word = { ...word }
                newWord.meta.definitionTargetLanguage = newDefinition
                updateWord(newWord, id)
              }}
            />
          </div>
          <div className="mb-2">
            <Label htmlFor="def_en">Definition English</Label>
            <TextArea
              id="def_en"
              value={word.meta.definitionEnglish}
              rows={5}
              onChange={(newDefinition: string) => {
                const newWord: Word = { ...word }
                newWord.meta.definitionEnglish = newDefinition
                updateWord(newWord, id)
              }}
            />
          </div>
          <div className="mb-2">
            <Label htmlFor="vocab_only">
              <Checkbox
                id="vocab_only"
                value={word.meta.vocabCard}
                onChange={(newValue: boolean) => {
                  const newWord: Word = { ...word }
                  newWord.meta.vocabCard = newValue
                  updateWord(newWord, id)
                }}
              />
              <span className="ml-2">Vocabulary card</span>
            </Label>
          </div>
          <div className="flex justify-end gap-x-4">
            <Button
              onClick={() => {
                const newWord: Word = { ...word }
                newWord.done = !word.done
                updateWord(newWord, id)

                if (word.meta.externalId && newWord.done) {
                  markCardAsExported(word.meta.externalId)
                }
              }}
            >
              Mark as {word.done ? 'WIP' : 'Done'}
            </Button>
            <Button type="submit" primary>
              Export
            </Button>
          </div>
        </form>
      </div>
      <div className="bg-gray-50 w-1/2 px-8 py-6">
        <h2 className="text-xl font-bold mb-4">Dictionaries</h2>
        <div>
          <ul className="flex gap-2 flex-wrap">
            {dictionaries.map(d => (
              <li key={d.name}>
                <a
                  href={d.url(word.value)}
                  target="_blank"
                  className="font-bold text-sm py-1 px-3 rounded border-2 block border-gray-800 text-gray-800 hover:opacity-50 transition duration-200 ease-in-out"
                >
                  {d.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <h2 className="text-xl font-bold my-4">Example sentences</h2>
        <SentenceList
          word={word}
          sentences={sentences}
          activeSentence={word.meta.sentence}
          onSelect={(sentence: Sentence) => {
            const newWord: Word = {
              ...word,
              meta: {
                ...word.meta,
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

const AudioPlayer = ({ url }: { url: string }) => {
  const audio = useMemo(() => new Audio(url), [url])
  return (
    <Button
      onClick={() => audio.play()}
      overrides="border bg-gray-300 border-opacity-0 mt-1"
    >
      Play
    </Button>
  )
}

export default CardWizard
