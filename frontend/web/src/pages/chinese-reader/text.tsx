import type { NextPage } from 'next'
import { useEffect, useState } from 'react'
import Layout, { PageTitle } from '@app/Layout'
import Button from '@app/anki/components/Button'
import TextInput from '@app/chinesereader/TextInput'
import Reader from '@app/chinesereader/TextReader'
import { useRouter } from 'next/router'
import { getText } from '@app/chinesereader/domain'

const TextReader: NextPage<{}> = () => {
  const [text, setText] = useState<string | undefined>()
  const router = useRouter()
  const id = router.query['id']

  useEffect(() => {
    if (!id) {
      return
    }

    getText(id.toString()).then(t => setText(t?.content))
  }, [id])

  if (!text && id) {
    return (
      <Layout
        darkMode={true}
        navigation={() => (
          <>
            <PageTitle>Chinese Text Reader</PageTitle>
          </>
        )}
      >
        Loading...
      </Layout>
    )
  }

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
          <Button
            onClick={() => {
              router.replace('/chinese-reader/text', undefined, {
                shallow: true,
              })
              setText(undefined)
            }}
          >
            Reset text
          </Button>
        </>
      )}
    >
      <Reader text={text} />
    </Layout>
  )
}

export default TextReader
