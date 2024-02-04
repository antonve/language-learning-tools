import type { NextPage } from 'next'
import MangaReader from '@app/mangareader/MangaReader'
import { createPendingCard } from '@app/chinesereader/domain'

const GermanMangaReader: NextPage<{}> = () => {
  return (
    <MangaReader
      useVertical={false}
      createCard={async ({ token, image, meta }) =>
        await createPendingCard({
          id: undefined,
          language_code: 'deu',
          token,
          source_image: image,
          meta: {
            card_type: 'sentence',
            ...meta,
          },
        })
      }
    />
  )
}

export default GermanMangaReader
