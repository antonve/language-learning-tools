import {
  CardType,
  getReadingPairs,
  toneToColor,
  TextAnalyseToken,
} from 'src/lib/chinesereader/domain'
import { Button, ButtonLink } from 'src/lib/chinesereader/Components'
import {
  CedictResultCollection,
  CedictResultEntry,
} from 'src/lib/anki/components/zh/api'

interface Props {
  word: TextAnalyseToken | undefined
  exportWord: (
    cardType: CardType,
    def: CedictResultEntry | undefined,
  ) => Promise<void>
  resetFocusWord: () => void
  defs: CedictResultCollection
}

const FocusWordPanel = ({ word, exportWord, resetFocusWord, defs }: Props) => {
  if (!word) {
    return null
  }

  const dict = defs[word.hanzi_traditional]

  if (!dict) {
    return (
      <div className="border-2 border-opacity-30 border-yellow-400 p-4">
        No dictionary results
      </div>
    )
  }

  return (
    <div className="border-2 border-opacity-30 border-yellow-400 bg-yellow-50 p-4 dark:bg-gray-900 dark:border-gray-900">
      <div className="flex space-between mb-4 justify-between">
        <h2 className="text-4xl">{word.hanzi_traditional}</h2>
        {word.hanzi_simplified != word.hanzi_traditional ? (
          <span title="simplified" className="text-4xl">
            {word.hanzi_simplified}
          </span>
        ) : null}

        <Button
          onClick={() =>
            exportWord('sentence', undefined)
              .then(() => resetFocusWord())
              .catch(reason => window.alert('could not export word: ' + reason))
          }
          className="bg-pink-100 text-pink-500 hover:bg-pink-200 hover:text-pink-50 dark:bg-pink-900 dark:text-pink-300 dark:hover:bg-pink-700 dark:hover:text-pink-100"
        >
          Export
        </Button>
        <ButtonLink
          href={`https://www.mdbg.net/chinese/dictionary?page=worddict&wdrst=1&wdqb=${word.hanzi_traditional}`}
          target="_blank"
          className="bg-violet-100 text-violet-500 hover:bg-violet-200 hover:text-violet-50 dark:bg-violet-900 dark:text-violet-300 dark:hover:bg-violet-700 dark:hover:text-violet-100"
        >
          Dictionary
        </ButtonLink>
      </div>

      {dict.results.length > 0 ? (
        <div className="divide-y-2 divide-yellow-400 divide-opacity-30 space-y-2 dark:divide-gray-800">
          {dict.results.map(d => (
            <div className="flex pt-2" key={JSON.stringify(d)}>
              <Reading entry={d} />
              <ol className="list-decimal pl-5 flex-grow">
                {d.meanings.map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ol>

              <div className="flex flex-col space-y-2">
                <Button
                  onClick={() =>
                    exportWord('sentence', d)
                      .then(() => resetFocusWord())
                      .catch(reason =>
                        window.alert('could not export word: ' + reason),
                      )
                  }
                  className="bg-green-100 text-green-500 hover:bg-green-200 hover:text-green-500 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-700 dark:hover:text-green-100"
                >
                  Export sentence
                </Button>
                <Button
                  onClick={() =>
                    exportWord('vocab', d)
                      .then(() => resetFocusWord())
                      .catch(reason =>
                        window.alert('could not export word: ' + reason),
                      )
                  }
                  className="bg-blue-100 text-blue-500 hover:bg-blue-200 hover:text-blue-500 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-700 dark:hover:text-blue-100"
                >
                  Export vocab
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-red-300 font-bold pt-3 text-2xl text-center opacity-80">
          No results found
        </p>
      )}
    </div>
  )
}

export default FocusWordPanel

const Reading = ({ entry }: { entry: CedictResultEntry }) => {
  const pairs = getReadingPairs(entry)

  return (
    <span className="text-4xl min-w-48 pr-10">
      {pairs.map((p, i) => (
        <span key={i} className={toneToColor(p.tone)}>
          {p.reading}
        </span>
      ))}
    </span>
  )
}
