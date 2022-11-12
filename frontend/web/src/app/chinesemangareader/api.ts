import { root } from '@app/anki/api'
import { CedictResultEntry } from '@app/anki/components/zh/api'
import { CardType, createPendingCard } from '@app/chinesemangareader/domain'

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
  const url = `${root}/zh/text-analyse`
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
  def: CedictResultEntry,
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
      pinyin: def.pinyin.toLowerCase(),
      pinyin_tones: def.pinyin_tones.toLowerCase(),
      meanings: def.meanings ?? [],
    },
  })
}
