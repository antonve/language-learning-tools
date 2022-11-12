import type { NextPage } from 'next'
import { useState } from 'react'
import Layout, { PageTitle } from '@app/Layout'
import Button from '@app/anki/components/Button'
import TextInput from '@app/chinesereader/TextInput'
import Reader from '@app/chinesereader/Reader'

const TextReader: NextPage<{}> = () => {
  const [text, setText] = useState<string | undefined>()

  if (!text) {
    return (
      <Layout
        darkMode={true}
        navigation={() => (
          <>
            <PageTitle>Chinese Text Reader</PageTitle>
          </>
        )}
      >
        <TextInput submitText={setText} />
      </Layout>
    )
  }

  return (
    <Layout
      darkMode={true}
      bodyClassName={`flex-grow flex px-10 pb-10`}
      navigation={() => (
        <>
          <PageTitle>Chinese Text Reader</PageTitle>
          <Button onClick={() => setText(undefined)}>Reset text</Button>
        </>
      )}
    >
      <Reader text={text} />
    </Layout>
  )
}

export default TextReader
