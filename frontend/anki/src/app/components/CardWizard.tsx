import classNameNames from 'classnames'
import { Word } from '@app/domain'
import Button from '@app/components/Button'
import { Input, TextArea, Label } from '@app/components/Form'

const CardWizard = ({ word }: { word: Word }) => {
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

export default CardWizard
