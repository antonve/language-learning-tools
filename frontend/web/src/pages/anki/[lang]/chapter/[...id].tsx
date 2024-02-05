import type { NextPage } from 'next'

import Layout from 'src/lib/Layout'
import { useChapter } from 'src/lib/anki/hooks'
import { useRouter } from 'next/dist/client/router'

const Chapter: NextPage = () => {
  const router = useRouter()
  const [series, filename] = (router.query?.id ?? []) as string[]
  const lang = (router.query?.lang as string) ?? ''

  const { chapter, finished } = useChapter(lang, series, filename)

  if (chapter === undefined || !finished) {
    return <Layout>Loading...</Layout>
  }

  return (
    <Layout>
      <h1 className="text-center text-2xl font-bold my-4">
        {chapter.series} - {chapter.title}
      </h1>
      <div className="w-full max-w-screen-sm mx-auto">
        <ChapterBody text={chapter.body} />
      </div>
    </Layout>
  )
}

const ChapterBody = ({ text }: { text: string }) => {
  const paragraphs = text.split('\n')

  return (
    <>
      {paragraphs.map((text, i) => (
        <p key={i}>{text === '' ? '\u00A0' : text}</p>
      ))}
    </>
  )
}

export default Chapter
