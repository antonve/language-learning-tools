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
      {sentences.results.map(s => (
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
    <li
      className={classNames(
        'my-3 rounded shadow-s transition duration-200 ease-in-out bg-white hover:ring ring-purple-300 ring-opacity-100',
        {
          'ring ring-purple-500 ring-opacity-100': isActive,
        },
      )}
    >
      <a
        href="#"
        onClick={() => onSelect(sentence)}
        className={'block px-4 py-3'}
      >
        {sentence.line}
      </a>
      <span className="block w-100 text-xs px-4 pb-2 text-gray-500">
        <a href="#">
          {sentence.series} - {sentence.chapter}
        </a>
      </span>
    </li>
  )
}
