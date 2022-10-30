export const dictionaries: { name: string; url: (word: string) => string }[] = [
  {
    name: 'MDBG',
    url: word =>
      `https://www.mdbg.net/chinese/dictionary?page=worddict&wdrst=1&wdqb=${encodeURI(
        word,
      )}`,
  },
]
