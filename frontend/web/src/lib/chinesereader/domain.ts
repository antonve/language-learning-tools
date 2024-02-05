import { unzipSync } from 'fflate'
import getConfig from 'next/config'
import { CedictResultEntry } from 'src/lib/anki/components/zh/api'

const { publicRuntimeConfig } = getConfig()

const root = publicRuntimeConfig.API_ROOT || 'http://localhost:8080'

export interface TextAnalyseToken {
  hanzi_traditional: string
  hanzi_simplified: string
  start: number
  end: number
}

export interface TextAnalyseLine {
  simplified: string
  traditional: string
  tokens: TextAnalyseToken[]
}

export interface TextAnalyseResponse {
  lines: TextAnalyseLine[]
}

export const textAnalyse = async (
  text: string,
): Promise<TextAnalyseResponse> => {
  const url = `${root}/zh_TW/text-analyse`
  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({ text }),
  })

  if (response.status !== 200) {
    throw new Error('could not analyse text')
  }

  const body = await response.json()

  return body
}

export const exportWordToAnki = (
  cardType: CardType,
  def: CedictResultEntry | undefined,
  focusWord: TextAnalyseToken,
  sentence: string,
  source_image?: string | undefined,
) => {
  return createPendingCard({
    id: undefined,
    language_code: 'zho',
    token: focusWord.hanzi_traditional,
    source_image,
    meta: {
      sentence,
      card_type: cardType,
      hanzi_traditional: focusWord.hanzi_traditional,
      hanzi_simplified: focusWord.hanzi_simplified,
      pinyin: def?.pinyin.toLowerCase(),
      pinyin_tones: def?.pinyin_tones.toLowerCase(),
      meanings: def?.meanings ?? [],
    },
  })
}

export interface FocusWordWithSentence {
  word: TextAnalyseToken
  sentence: string
}

export type CardType = 'sentence' | 'vocab'

export interface OcrBoundingBox {
  vertices: {
    x: number
    y: number
  }[]
}

export interface OcrWord {
  bounding_box: OcrBoundingBox
  symbols: {
    bounding_box: OcrBoundingBox
    text: string
    confidence: number
  }[]
}

export interface OcrParagraph {
  bounding_box: OcrBoundingBox
  words: OcrWord[]
  confidence: number
}

export interface OcrBlock {
  bounding_box: OcrBoundingBox
  block_type: number
  confidence: number
  paragraphs: OcrParagraph[]
}

export interface OcrResult {
  text: string
  pages: {
    blocks: OcrBlock[]
  }[]
}

export interface Word {
  id: string
  text: string
  boundingBox: OcrBoundingBox
}

export interface Sentence {
  words: Word[]
}

export const parseOcrForTextAnalyse = (ocr: OcrResult): string => {
  return ocr.pages
    .flatMap(p => p.blocks.map(b => getRawTextForBlock(b)).join('\n'))
    .join('\n')
}

export const getWordsFromOcrResult = (ocr: OcrResult): Word[] => {
  const res = []

  for (const page of ocr.pages) {
    for (const block of page.blocks) {
      const sentences = getTextForBlock(block)
      const words = sentences.map(s => s.words)
      res.push(...words.flat())
    }
  }

  return Array.from(new Set(res))
}

export const getBoundingBoxHash = (box: OcrBoundingBox): string => {
  const res = ['block', ...box.vertices.map(({ x, y }) => [x, y]).flat()]
  return res.join('_')
}

export const getTextForBlock = (block: OcrBlock): Sentence[] => {
  const sentences = []

  for (const p of block.paragraphs) {
    sentences.push(getTextForParagraph(p))
  }

  return sentences
}

export const getRawTextForBlock = (block: OcrBlock): string => {
  const sentences = getTextForBlock(block)
  const res = []

  for (const sentence of sentences) {
    for (const word of sentence.words) {
      res.push(word.text)
    }
  }

  return res.join('')
}

const getTextForParagraph = (p: OcrParagraph): Sentence => {
  const words = []

  for (const word of p.words) {
    const w = []
    for (const symbol of word.symbols) {
      w.push(symbol.text)
    }
    const text = w.join('')
    words.push({
      text,
      boundingBox: word.bounding_box,
      id: `word_${text}_${getBoundingBoxHash(word.bounding_box)}`,
    })
  }

  return { words }
}

export const fetchOcr = async (image: Uint8Array): Promise<OcrResult> => {
  const url = `${root}/ocr`
  const response = await fetch(url, { method: 'POST', body: image })

  if (response.status !== 200) {
    throw new Error('not found')
  }

  const body = await response.json()

  return body
}

const zip = <T>(a: T[], b: T[]) => a.map((k, i) => [k, b[i]])

export const getReadingPairs = (entry: {
  pinyin_tones: string
  pinyin: string
}): { reading: string; tone: number }[] => {
  const pairs = zip(entry.pinyin_tones.split(' '), entry.pinyin.split(' '))

  return pairs.map(([reading, tone]) => {
    const t = tone.match(/\d+/)

    return {
      reading: reading.toLowerCase(),
      tone: t ? Number(t) : -1,
    }
  })
}

const toneColors: { [key: number]: string } = {
  1: 'text-red-500 dark:text-red-600',
  2: 'text-orange-500 dark:text-orange-400',
  3: 'text-green-500 dark:text-green-300',
  4: 'text-blue-500 dark:text-blue-400',
}

export const toneToColor = (tone: number) => {
  if (tone in toneColors) {
    return toneColors[tone]
  }
  return ''
}

export interface Book {
  title: string
  pages: any[]
}

export async function processBook(file: File): Promise<Book> {
  const zip = unzipSync(new Uint8Array(await file.arrayBuffer()))

  const book: Book = {
    pages: [],
    title: file.name.replace(/\.[^/.]+$/, ''),
  }

  const pages = Object.keys(zip)
  pages.sort()

  for (const path of pages) {
    book.pages.push(zip[path])
  }

  return book
}

export function arrayBufferToBase64(buffer: Uint8Array) {
  var binary = ''
  var bytes = new Uint8Array(buffer)
  var len = bytes.byteLength
  for (var i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return window.btoa(binary)
}

export interface Card {
  id: undefined | number
  token: string
  language_code: string
  source_image?: string
  meta: object
}

export const createPendingCard = async (card: Card): Promise<void> => {
  const url = `${root}/pending_cards`
  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(card),
  })

  if (response.status !== 201) {
    throw new Error('could not create card')
  }

  return
}

export const createText = async (request: {
  title: string
  content: string
  language_code: string
}): Promise<any> => {
  const url = `${root}/texts`
  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(request),
  })
  const body = await response.json()

  return body
}

export interface ListTextsResponse {
  texts: {
    id: number
    title: string
  }[]
}

export const listTexts = async (
  languageCode: string,
): Promise<ListTextsResponse> => {
  const url = `${root}/texts?language_code=${languageCode}`
  const response = await fetch(url)

  if (response.status !== 200) {
    return {
      texts: [],
    }
  }

  const body = await response.json()

  return body
}

export interface GetTextResponse {
  id: number
  title: string
  content: string
  last_position?: number
}

export const getText = async (
  id: string,
): Promise<GetTextResponse | undefined> => {
  const url = `${root}/texts/${id}`
  const response = await fetch(url)

  if (response.status !== 200) {
    return
  }

  const body = await response.json()

  return body
}

export const updateLastPositionText = async (
  id: number,
  last_position: number,
): Promise<void> => {
  const url = `${root}/texts/${id}/last_position`
  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({ last_position }),
  })

  if (response.status !== 200) {
    return Promise.reject()
  }
}

export interface Text {
  id?: number
  title?: string
  content: string
  last_position?: number
}
