import { unzipSync } from 'fflate'

const root = 'http://localhost:8080'

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
  text: string
  boundingBox: OcrBoundingBox
}

export interface FocusWord {
  word: Word
  block: OcrBlock
  cedict: CedictEntry | undefined
}

export interface Sentence {
  words: Word[]
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

const getTextForParagraph = (p: OcrParagraph): Sentence => {
  const words = []

  for (const word of p.words) {
    const w = []
    for (const symbol of word.symbols) {
      w.push(symbol.text)
    }

    words.push({ text: w.join(''), boundingBox: word.bounding_box })
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

export type CedictResponse = { [key: string]: CedictEntry }

export interface CedictEntry {
  source: string
  pinyin_tones: string
  pinyin: string
  hanzi_simplified: string
  hanzi_traditional: string
  meanings: string[]
}

export const fetchCedict = async (words: Word[]): Promise<CedictResponse> => {
  const url = `${root}/zh/cedict`
  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({ words: words.map(w => w.text) }),
  })

  if (response.status !== 200) {
    throw new Error('not found')
  }

  const body = await response.json()

  return body
}

const zip = <T>(a: T[], b: T[]) => a.map((k, i) => [k, b[i]])

export const getReadingPairs = (
  entry: CedictEntry,
): { reading: string; tone: number }[] => {
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
  1: 'text-red-500',
  2: 'text-orange-500',
  3: 'text-green-500',
  4: 'text-blue-500',
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
