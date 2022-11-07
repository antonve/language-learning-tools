import type { NextPage } from 'next'
import { useEffect, useState } from 'react'
import Layout from '@app/Layout'
import { getPendingCards, PendingCardsResponse } from '@app/anki/api'

const MinedWords: NextPage<{}> = () => {
  const [words, setWords] = useState<PendingCardsResponse['cards']>([])

  useEffect(() => {
    getPendingCards('zho').then(res => {
      setWords(res.cards)
    })
  }, [])

  return (
    <Layout
      navigation={() => (
        <h1 className="text-gray-900 text-base no-underline hover:no-underline font-extrabold text-xl">
          Mined Words Manager
        </h1>
      )}
    >
      <ul>
        {words.map(w => (
          <li key={w.id}>{w.token}</li>
        ))}
      </ul>
    </Layout>
  )
}

export default MinedWords
