import type { NextPage } from 'next'
import MangaReader from '@app/mangareader/MangaReader'

const GermanMangaReader: NextPage<{}> = () => {
  return <MangaReader useVertical={false} />
}

export default GermanMangaReader
