import type { NextPage } from 'next'
import { useEffect, useState } from 'react'
import Layout, { PageTitle } from '@app/Layout'
import Button from '@app/anki/components/Button'
import TextInput from '@app/chinesereader/TextInput'
import Reader from '@app/chinesereader/TextReader'
import { listTexts, ListTextsResponse } from '@app/chinesereader/domain'

const Index: NextPage<{}> = () => {
  const [texts, setTexts] = useState<ListTextsResponse>()

  useEffect(() => {
    listTexts('zho').then(res => setTexts(res))
  }, [])

  if (!texts) {
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

  return (
    <Layout
      darkMode={true}
      bodyClassName={`flex-grow flex px-10 pb-10`}
      navigation={() => (
        <>
          <PageTitle>Chinese Text Reader</PageTitle>
        </>
      )}
    >
      <ul>
        {texts.texts.map(t => (
          <li key={t.id}>
            <a href={`/chinese-reader/text?id=${t.id}`}>{t.title}</a>
          </li>
        ))}
      </ul>
    </Layout>
  )
}

export default Index
