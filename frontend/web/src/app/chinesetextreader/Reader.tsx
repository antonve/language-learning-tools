import type { NextPage } from 'next'

interface Props {
  text: string
}

const Reader: NextPage<Props> = ({ text }) => {
  return <p>{text}</p>
}

export default Reader
