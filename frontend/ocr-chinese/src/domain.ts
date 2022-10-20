import { unzipSync } from 'fflate'

const root = 'http://localhost:8080'

interface OcrBoundingBox {
  vertices: {
    x: number
    y: number
  }[]
}

interface OcrWord {
  bounding_box: OcrBoundingBox
  symbols: {
    bounding_box: OcrBoundingBox
    text: string
    confidence: number
  }[]
}

interface OcrParagraph {
  bounding_box: OcrBoundingBox
  words: OcrWord[]
  confidence: number
}

interface OcrBlock {
  bounding_box: OcrBoundingBox
  block_type: number
  confidence: number
  paragraphs: OcrParagraph[]
}

export interface OcrResult {
  text: string
  pages: {
    blocks: OcrBlock[]
  }
}

export interface Word {
  text: string
}

export interface Sentence {
  words: Word[]
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
      w.push(symbol)
    }

    words.push({ text: w.join('') })
  }

  return { words }
}

export const getOcr = async (image: Uint8Array): Promise<OcrResult> => {
  const url = `${root}/ocr`
  const response = await fetch(url, { method: 'POST', body: image })

  if (response.status !== 200) {
    throw new Error('not found')
  }

  const body = await response.json()

  return body
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
