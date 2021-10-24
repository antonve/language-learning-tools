import { useState } from 'react'
import Button from '@app/components/Button'
import Modal from '@app/components/Modal'
import { TextArea, Label } from '@app/components/Form'

interface Props {
  addWords: (words: string[]) => void
}

const AddWordsButton = ({ addWords }: Props) => {
  const [isOpen, setIsOpen] = useState(true)
  const [words, setWords] = useState('')

  const saveWords = () => {
    const newWords = words.split('\n')
    addWords(newWords)
    setIsOpen(false)
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Add Words</Button>
      <Modal
        title="Add Words"
        isOpen={isOpen}
        closeModal={() => setIsOpen(false)}
      >
        <form onSubmit={saveWords}>
          <div className="mb-4 w-96">
            <Label htmlFor="words">Words (one per line)</Label>
            <TextArea id="words" rows={20} value={words} onChange={setWords} />
          </div>

          <div className="flex justify-end">
            <Button
              onClick={() => {
                setWords('')
                setIsOpen(false)
              }}
            >
              Cancel
            </Button>
            <span className="ml-5">
              <Button primary type="submit">
                Save
              </Button>
            </span>
          </div>
        </form>
      </Modal>
    </>
  )
}

export default AddWordsButton
