import type { NextPage } from 'next'
import { segmentText } from '@app/chinesetextreader/domain'

interface Props {
  text: string
}

const Reader: NextPage<Props> = ({ text }) => {
  return <p>{segmentText(text)}</p>
}

export default Reader
