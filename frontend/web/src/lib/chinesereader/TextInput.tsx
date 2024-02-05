import type { NextPage } from 'next'
import { Dispatch, SetStateAction, useState } from 'react'
import { TextArea } from 'src/lib/anki/components/Form'
import Button from 'src/lib/anki/components/Button'
import { Text } from './domain'

interface Props {
  submitText: Dispatch<SetStateAction<Text | undefined>>
  saveText: (text: string) => void
}

const TextInput: NextPage<Props> = ({ submitText, saveText }) => {
  const [text, setText] = useState<string | undefined>()

  return (
    <form
      onSubmit={e => {
        e.preventDefault()
        submitText({ content: text ?? '' })
      }}
    >
      <div className="mb-4">
        <TextArea
          id="text"
          value={text}
          onChange={val => setText(val)}
          rows={20}
        />
      </div>
      <div className="space-x-4">
        <Button type="submit">Start reading</Button>
        <Button
          onClick={() => {
            if (!text) return
            saveText(text)
          }}
          disabled={!text}
        >
          Save text & read
        </Button>
      </div>
    </form>
  )
}

export default TextInput
