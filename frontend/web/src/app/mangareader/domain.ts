import { unzipSync } from 'fflate'
import getConfig from 'next/config'

const { publicRuntimeConfig } = getConfig()

const root = publicRuntimeConfig.API_ROOT || 'http://localhost:8080'
// const root = 'https://tools.tadoku.app/api'

export interface Tokens {
  selectedIndices: Map<number, boolean>
  list: VisionText[]
}

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

export const fetchOcr = async (image: Uint8Array): Promise<OcrResult> => {
  const url = `${root}/ocr`
  const response = await fetch(url, { method: 'POST', body: image })

  if (response.status !== 200) {
    throw new Error('not found')
  }

  const body = await response.json()

  return body
}

export interface VisionText {
  locale: string
  description: string
  bounding_poly: {
    vertices: { x: number; y: number }[]
  }
}

export const fetchDetectTexts = async (
  image: Uint8Array,
): Promise<VisionText[]> => {
  const url = `${root}/detect-texts`
  const response = await fetch(url, { method: 'POST', body: image })

  if (response.status !== 200) {
    throw new Error('not found')
  }

  const body = await response.json()

  return body
}

export function getPosition(vertices: VisionText['bounding_poly']['vertices']) {
  const y = vertices.map(it => it.y)
  const x = vertices.map(it => it.x)

  const top = Math.min(...y)
  const bottom = Math.max(...y)
  const left = Math.min(...x)
  const right = Math.max(...x)

  const height = bottom - top
  const width = right - left

  return {
    top,
    bottom,
    left,
    right,
    height,
    width,
  }
}
