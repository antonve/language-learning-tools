import type { NextPage } from 'next'
import { useState } from 'react'
import Layout from '@app/Layout'
import Button from '@app/anki/components/Button'
import TextInput from '@app/chinesetextreader/TextInput'
import Reader from '@app/chinesetextreader/Reader'

const TextReader: NextPage<{}> = () => {
  const [text, setText] = useState<string | undefined>()

  if (!text) {
    return (
      <Layout
        navigation={() => (
          <>
            <h1 className="text-gray-900 text-base no-underline hover:no-underline font-extrabold text-xl">
              Chinese Text Reader
            </h1>
          </>
        )}
      >
        <TextInput submitText={setText} />
      </Layout>
    )
  }

  return (
    <Layout
      navigation={() => (
        <>
          <h1 className="text-gray-900 text-base no-underline hover:no-underline font-extrabold text-xl">
            Chinese Text Reader
          </h1>
          <Button onClick={() => setText(undefined)}>Reset text</Button>
        </>
      )}
    >
      <Reader text={text} />
    </Layout>
  )
}

export default TextReader
