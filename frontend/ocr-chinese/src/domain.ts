import { unzipSync } from 'fflate'

const root = 'http://localhost:8080'

export const getOcr = async (image: Uint8Array): Promise<any> => {
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
