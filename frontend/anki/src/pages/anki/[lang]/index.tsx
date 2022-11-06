import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import Error from 'next/error'

import ChineseApp from '@app/anki/components/zh/ChineseApp'
import JapaneseApp from '@app/anki/components/ja/JapaneseApp'

const Home: NextPage = () => {
  const router = useRouter()

  switch (router.query.lang) {
    case 'ja':
      return <JapaneseApp />
    case 'zh':
      return <ChineseApp />
    case undefined: // needed to prevent flash of 404 on initial load
      return null
  }

  return <Error statusCode={404} />
}

export default Home
