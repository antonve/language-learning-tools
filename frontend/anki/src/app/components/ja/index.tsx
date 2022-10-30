export const dictionaries: { name: string; url: (word: string) => string }[] = [
  {
    name: 'ALC',
    url: word => `http://eow.alc.co.jp/search?q=${encodeURI(word)}`,
  },
  {
    name: 'Jisho',
    url: word => `https://jisho.org/search/${encodeURI(word)}`,
  },
  {
    name: 'Goo',
    url: word => `http://dictionary.goo.ne.jp/srch/all/${encodeURI(word)}/m0u/`,
  },
  {
    name: 'Google',
    url: word => `https://www.google.com/search?q=${encodeURI(word)}`,
  },
  {
    name: 'Kotobank',
    url: word => `https://kotobank.jp/gs/?q=${encodeURI(word)}`,
  },
  {
    name: 'Weblio',
    url: word => `https://www.weblio.jp/content/${encodeURI(word)}`,
  },
  {
    name: 'Syosetu',
    url: word =>
      `https://www.google.com/search?q=site%3Ancode.syosetu.com%2F+%22${encodeURI(
        word,
      )}%22`,
  },
  {
    name: 'Idioms',
    url: word => `https://idiom-encyclopedia.com/?s=${encodeURI(word)}`,
  },
  {
    name: 'Rei',
    url: word => `http://yourei.jp/${encodeURI(word)}`,
  },
]
