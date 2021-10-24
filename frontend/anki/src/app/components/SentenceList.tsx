import classNames from 'classnames'

import { SentencesResult, Sentence, compareSentences } from '@app/domain'

const SentenceList = ({
  sentences,
  onSelect,
  activeSentence,
}: {
  sentences: SentencesResult | undefined
  activeSentence: Sentence | undefined
  onSelect: (sentence: Sentence) => void
}) => {
  if (!sentences || sentences.results.length === 0) {
    return <>no sentences found</>
  }

  return (
    <ul>
      {sentences.results.map((s, i) => (
        <SentenceListItem
          sentence={s}
          isActive={
            activeSentence === undefined
              ? false
              : compareSentences(activeSentence, s)
          }
          onSelect={onSelect}
          key={JSON.stringify(s)}
        />
      ))}
    </ul>
  )
}

export default SentenceList

const SentenceListItem = ({
  sentence,
  isActive,
  onSelect,
}: {
  sentence: Sentence
  isActive: boolean
  onSelect: (sentence: Sentence) => void
}) => {
  return (
    <li className="-mx-3 my-3 rounded shadow-s transition duration-200 ease-in-out hover:shadow-md  overflow-hidden">
      <a
        href="#"
        onClick={() => onSelect(sentence)}
        className={classNames('hover:opacity-50 block px-4 py-3 bg-white ', {
          'bg-purple-600 text-white': isActive,
        })}
      >
        {sentence.line}
      </a>
      <span className="block w-100 text-xs px-4 py-2 bg-gray-900 text-gray-100">
        <a href="#">
          {sentence.series} - {sentence.chapter}
        </a>
      </span>
    </li>
  )
}
