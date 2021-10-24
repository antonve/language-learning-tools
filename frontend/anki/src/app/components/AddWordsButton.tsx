import { useState } from 'react'
import Button from '@app/components/Button'
import Modal from '@app/components/Modal'
import { TextArea, Label } from '@app/components/Form'

const AddWordsButton = () => {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Add Words</Button>
      <Modal
        title="Add Words"
        isOpen={isOpen}
        closeModal={() => setIsOpen(false)}
      >
        <form>
          <div className="mb-4 w-96">
            <Label htmlFor="words">Words (one per line)</Label>
            <TextArea id="words" rows={20} />
          </div>

          <div className="flex justify-end">
            <Button>Cancel</Button>
            <span className="ml-5">
              <Button primary>Save</Button>
            </span>
          </div>
        </form>
      </Modal>
    </>
  )
}

export default AddWordsButton
