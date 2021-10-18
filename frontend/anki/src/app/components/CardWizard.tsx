import classNameNames from 'classnames'
import { Word } from '@app/domain'
import Button from '@app/components/Button'
import { Input, Label } from '@app/components/Form'

const CardWizard = ({ word }: { word: Word }) => {
  return (
    <div>
      <form className="px-8 py-6">
        <div className="mb-4">
          <Label htmlFor="sentence">Sentence</Label>
          <Input id="sentence" type="text" />
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
  )
}

export default CardWizard
