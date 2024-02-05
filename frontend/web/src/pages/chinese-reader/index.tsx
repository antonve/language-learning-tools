import type { NextPage } from 'next'
import { useEffect, useState } from 'react'
import Layout, { PageTitle } from 'src/lib/Layout'
import { listTexts, ListTextsResponse } from 'src/lib/chinesereader/domain'
import { ButtonLink } from 'src/lib/anki/components/Button'

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
          <ButtonLink href="/chinese-reader/text">Add text</ButtonLink>
        </>
      )}
    >
      <div className="w-full">
        <h2 className="text-2xl mb-4 font-bold">Saved texts</h2>
        <ul className="w-full">
          {texts.texts.map(t => (
            <li key={t.id} className={`my-2`}>
              <a
                href={`/chinese-reader/text?id=${t.id}`}
                className="block hover:bg-gray-900 py-3 bg-gray-700 rounded-lg px-4"
              >
                {t.title}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </Layout>
  )
}

export default Index
