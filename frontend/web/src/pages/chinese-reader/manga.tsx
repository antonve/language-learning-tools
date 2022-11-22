import type { NextPage } from 'next'
import { useEffect, useState } from 'react'
import BookImporter from '@app/chinesereader/BookImporter'
import BookNavigation from '@app/chinesereader/BookNavigation'
import BookPage from '@app/chinesereader/BookPage'
import {
  Book,
  fetchOcr,
  CardType,
  parseOcrForTextAnalyse,
  FocusWordWithSentence,
  exportWordToAnki,
  textAnalyse,
  TextAnalyseResponse,
} from '@app/chinesereader/domain'
import Transcript from '@app/chinesereader/Transcript'
import Layout from '@app/Layout'
import {
  CedictResultCollection,
  CedictResultEntry,
  getCedictDefinitions,
} from '@app/anki/components/zh/api'
import FocusWordPanel from '@app/chinesereader/FocusWordPanel'

const ChineseMangaReader: NextPage<{}> = () => {
  const [book, setBook] = useState<Book>()
  const [page, setPage] = useState(0)
  const [canvasData, setCanvasData] = useState<string>('')
  const [transcript, setTranscript] = useState<TextAnalyseResponse>()
  const [focusWord, setFocusWord] = useState<FocusWordWithSentence>()
  const [defs, setDefs] = useState<CedictResultCollection>({})

  useEffect(() => {
    if (!transcript) {
      return
    }
    getCedictDefinitions(
      transcript.lines.flatMap(l => l.tokens.map(t => t.hanzi_traditional)),
    ).then(res => setDefs(res))
  }, [transcript])

  const exportWord = (
    cardType: CardType,
    def: CedictResultEntry | undefined,
  ) => {
    if (!focusWord) {
      return Promise.reject()
    }
    const prefix = 'data:image/jpeg;base64,'

    return exportWordToAnki(
      cardType,
      def,
      focusWord.word,
      focusWord.sentence,
      canvasData.slice(prefix.length),
    )
  }

  useEffect(() => setTranscript(undefined), [page])

  const loadTranscript = async () => {
    if (!book) {
      return
    }

    const ocr = await fetchOcr(book.pages[page])
    const transcript = await textAnalyse(parseOcrForTextAnalyse(ocr))
    setTranscript(transcript)
  }

  if (!book) {
    return (
      <Layout bodyClassName="">
        <div className="w-screen h-screen flex flex-col">
          <BookImporter setBook={setBook} />
        </div>
      </Layout>
    )
  }

  function onNextPage() {
    if (!book || book.pages.length - 1 <= page) {
      return
    }
    setFocusWord(undefined)
    setPage(page + 1)
  }

  function onPrevPage() {
    if (page <= 0) {
      return
    }
    setFocusWord(undefined)
    setPage(page - 1)
  }

  return (
    <div className="w-screen h-screen flex">
      <div className="w-1/2 h-screen flex flex-col overflow-auto relative">
        <div className="absolute left-20 top-20 right-20 z-50">
          <FocusWordPanel
            word={focusWord?.word}
            exportWord={exportWord}
            resetFocusWord={() => setFocusWord(undefined)}
            defs={defs}
          />
        </div>
        <BookPage
          book={book}
          index={page}
          setCanvasData={setCanvasData}
          onNextPage={onNextPage}
          onPrevPage={onPrevPage}
        />
      </div>
      <div className="w-1/2 flex-1 border-l-2 border-gray-200 flex flex-col">
        <BookNavigation
          book={book}
          page={page}
          setPage={setPage}
          onNextPage={onNextPage}
          onPrevPage={onPrevPage}
        />
        <div className="p-8 min-h-0 flex-1 overflow-auto">
          <div className="flex flex-row">
            <h2
              className="text-xl font-bold cursor-pointer"
              onClick={loadTranscript}
              title="Click to load transcript"
            >
              Transcript
            </h2>
          </div>
          <Transcript
            analyse={transcript}
            focusWord={focusWord}
            setFocusWord={setFocusWord}
            addDef={def => setDefs({ ...defs, [def.source]: def })}
          />
        </div>
      </div>
    </div>
  )
}

export default ChineseMangaReader
