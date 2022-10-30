import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import Error from 'next/error'

import Chinese from '@app/components/Chinese'
import Japanese from '@app/components/Japanese'

const Home: NextPage = () => {
  const router = useRouter()

  switch (router.query.lang) {
    case 'ja':
      return <Japanese />
    case 'zh':
      return <Chinese />
    case undefined: // needed to prevent flash of 404 on initial load
      return null
  }

  return <Error statusCode={404} />
}

export default Home
