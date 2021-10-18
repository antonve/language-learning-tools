import classNameNames from 'classnames'
import { useState, useEffect } from 'react'

import { Word, formatDefinitions, SentencesResult, Sentence } from '@app/domain'
import { getJishoDefinition, getSentences } from '@app/api'
import Button from '@app/components/Button'
import { TextInput, TextArea, Label } from '@app/components/Form'
import classNames from 'classnames'

const CardWizard = ({ word }: { word: Word | undefined }) => {
  const { definition: definitionEn } = useEnglishDefition(word?.value)
  const { sentences } = useSentences(word?.value)

  if (word === undefined) {
    return <div className="px-8 py-6 w-1/2">Select a word to add</div>
  }

  return (
    <div className="flex rounded overflow-hidden items-stretch">
      <div className="px-8 py-6 w-1/2">
        <h2 className="text-2xl font-bold mb-4">{word.value}</h2>
        <form>
          <div className="mb-4">
            <Label htmlFor="sentence">Sentence</Label>
            <TextArea id="sentence" rows={4} />
          </div>
          <div className="mb-6">
            <Label htmlFor="reading">Reading</Label>
            <TextInput id="reading" />
          </div>
          <div className="flex items-center justify-between">
            <Button>Save</Button>
          </div>
        </form>
      </div>
      <div className="bg-gray-200 w-1/2 px-8 py-6">
        <h2 className="text-xl font-bold mb-4">Example sentences</h2>
        <SentenceList sentences={sentences} />
      </div>
    </div>
  )
}

const SentenceList = ({
  sentences,
}: {
  sentences: SentencesResult | undefined
}) => {
  if (!sentences || sentences.results.length === 0) {
    return <>no sentences found</>
  }

  return (
    <ul>
      {sentences.results.map((s, i) => (
        <SentenceListItem sentence={s} isActive={i === 0} />
      ))}
    </ul>
  )
}

const SentenceListItem = ({
  sentence,
  isActive,
}: {
  sentence: Sentence
  isActive: boolean
}) => {
  return (
    <li
      className={classNames(
        'px-4 pt-3 -mx-3 my-3 rounded bg-white shadow-s transition duration-200 ease-in-out cursor-pointer hover:shadow-md hover:opacity-50 overflow-hidden',
        { 'bg-purple-600 text-white': isActive },
      )}
    >
      {sentence.line}
      <span className="block w-100 text-xs -mx-4 px-4 py-2 mt-3 bg-gray-900 text-gray-100">
        <a href="#">
          {sentence.series} - {sentence.chapter}
        </a>
      </span>
    </li>
  )
}

const useSentences = (word: string | undefined) => {
  const [sentences, setSentences] = useState(
    undefined as SentencesResult | undefined,
  )

  useEffect(() => {
    if (word === undefined) {
      return
    }
    const update = async () => {
      const sentences = await getSentences(word)
      setSentences(sentences)
    }
    update()
  }, [word])

  return {
    sentences,
  }
}

const useEnglishDefition = (word: string | undefined) => {
  const [definition, setDefinition] = useState(undefined as string | undefined)

  useEffect(() => {
    if (word === undefined) {
      return
    }
    const update = async () => {
      const req = await getJishoDefinition(word)
      const def = formatDefinitions(req.definitions)
      setDefinition(def)
    }
    update()
  }, [word])

  return {
    definition,
  }
}

export default CardWizard
