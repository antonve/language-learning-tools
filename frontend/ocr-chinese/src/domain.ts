import { unzipSync } from 'fflate'

const root = 'http://localhost:8080'

interface BoundingBox {
  vertices: {
    x: number
    y: number
  }[]
}

interface Word {
  bounding_box: BoundingBox
  symbols: {
    bounding_box: BoundingBox
    text: string
    confidence: number
  }[]
}

interface Paragraph {
  bounding_box: BoundingBox
  words: Word[]
  confidence: number
}

interface Block {
  bounding_box: BoundingBox
  block_type: number
  confidence: number
  paragraphs: Paragraph[]
}

export interface OcrResult {
  text: string
  pages: {
    blocks: Block[]
  }
}

export const getTextForBlock = (block: Block): string[] => {
  const result = []

  for (const p of block.paragraphs) {
    result.push(getTextForParagraph(p))
  }

  return result
}

const getTextForParagraph = (p: Paragraph): string => {
  const symbols = []

  for (const word of p.words) {
    for (const symbol of word.symbols) {
      symbols.push(symbol.text)
    }
  }

  return symbols.join('')
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
