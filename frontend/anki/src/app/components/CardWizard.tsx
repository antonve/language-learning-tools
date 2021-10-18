import classNameNames from 'classnames'
import { useState, useEffect } from 'react'

import { Word, formatDefinitions } from '@app/domain'
import { getJishoDefinition, getSentences } from '@app/api'
import Button from '@app/components/Button'
import { Input, TextArea, Label } from '@app/components/Form'

const CardWizard = ({ word }: { word: Word }) => {
  const { definition: definitionEn } = useEnglishDefition(word.value)
  const { sentences } = useSentences(word.value)

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

const useSentences = (word: string) => {
  const [sentences, setSentences] = useState(
    undefined as SentencesResult | undefined,
  )

  useEffect(() => {
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

const useEnglishDefition = (word: string) => {
  const [definition, setDefinition] = useState(undefined as string | undefined)

  useEffect(() => {
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
