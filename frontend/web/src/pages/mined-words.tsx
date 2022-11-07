import type { NextPage } from 'next'
import { useEffect, useState } from 'react'
import Layout from '@app/Layout'
import {
  getPendingCards,
  PendingCardsResponse,
  updatePendingCard,
} from '@app/anki/api'
import { TextArea } from '@app/anki/components/Form'
import Button from '@app/anki/components/Button'

const MinedWords: NextPage<{}> = () => {
  const [words, setWords] = useState<PendingCardsResponse['cards']>([])
  const [metaCache, setMetaCache] = useState({} as { [key: string]: string })

  const fetchCards = () =>
    getPendingCards('zho').then(res => {
      setMetaCache({})
      setWords(res.cards)
    })

  useEffect(() => {
    fetchCards()
  }, [])

  const updateMeta = (id: number) => (meta: string) => {
    setMetaCache({ ...metaCache, [id]: meta })
  }

  const saveWord = (id: number) => () => {
    const meta = metaCache[id]
    if (!meta) {
      return
    }
    try {
      updatePendingCard(id, JSON.parse(meta)).then(() => {
        fetchCards()
      })
    } catch {
      alert('JSON is not valid')
      return
    }
  }

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
          <li key={w.id} className="flex">
            <div className="w-96 pr-8 flex flex-col justify-between">
              <h2 className="font-bold text-2xl">{w.token}</h2>
              <div className="flex space-x-4">
                <Button
                  primary
                  onClick={saveWord(w.id)}
                  disabled={!metaCache[w.id]}
                >
                  Save
                </Button>
                <Button>Delete</Button>
              </div>
            </div>
            <TextArea
              id={w.token}
              onChange={updateMeta(w.id)}
              value={metaCache[w.id] ?? JSON.stringify(w.meta, undefined, 4)}
            />
          </li>
        ))}
      </ul>
    </Layout>
  )
}

export default MinedWords
