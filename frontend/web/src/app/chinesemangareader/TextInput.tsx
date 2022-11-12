import type { NextPage } from 'next'
import { Dispatch, SetStateAction, useState } from 'react'
import { TextArea } from '@app/anki/components/Form'
import Button from '@app/anki/components/Button'

interface Props {
  submitText: Dispatch<SetStateAction<string | undefined>>
}

const TextInput: NextPage<Props> = ({ submitText }) => {
  const [text, setText] = useState<string | undefined>()

  return (
    <form
      onSubmit={e => {
        e.preventDefault()
        submitText(text)
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
      <Button type="submit">Start reading</Button>
    </form>
  )
}

export default TextInput
