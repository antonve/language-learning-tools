import { useState } from 'react'
import Button from '@app/components/Button'
import Modal from '@app/components/Modal'

const AddWordsButton = () => {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Add Words</Button>
      <Modal isOpen={isOpen} closeModal={() => setIsOpen(false)}>
        test
      </Modal>
    </>
  )
}

export default AddWordsButton
