import classNameNames from 'classnames'
import { useState, useEffect } from 'react'

import { Word, formatDefinitions, SentencesResult } from '@app/domain'
import { getJishoDefinition, getSentences } from '@app/api'
import Button from '@app/components/Button'
import { TextInput, TextArea, Label } from '@app/components/Form'

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
            <TextArea id="sentence" type="text" rows={4} />
          </div>
          <div className="mb-6">
            <Label htmlFor="reading">Reading</Label>
            <Input id="reading" type="text" />
          </div>
          <div className="flex items-center justify-between">
            <Button>Save</Button>
          </div>
        </form>
      </div>
      <div className="bg-gray-400 w-1/2"></div>
    </div>
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
