import JSZip from 'jszip'
import { unzipSync } from 'fflate'

export interface Book {
  pages: any[]
}

export async function processBook(file: File): Promise<Book> {
  const zip = unzipSync(new Uint8Array(await file.arrayBuffer()))

  const book: Book = {
    pages: [],
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
