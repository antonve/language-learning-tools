import type { NextPage } from 'next'
import MangaReader, { PopupEditorProps } from '@app/mangareader/MangaReader'
import {
  usePersistedTargetLanguage,
  LanguageSelect,
} from '@app/mangareader/LanguageSelect'
import { createPendingCard } from '@app/chinesereader/domain'
import { useState } from 'react'
import { useTranslation } from '@app/mangareader/domain'
import { useDebounce } from '@uidotdev/usehooks'
import { ArrowRightEndOnRectangleIcon } from '@heroicons/react/24/solid'

function GermanPopupEditor({
  defaultToken,
  initCardCreationFlow,
  initialCropArea,
  close,
}: PopupEditorProps) {
  const [token, setToken] = useState(defaultToken)
  const debouncedToken = useDebounce(token, 500)
  const sourceLanguageCode = 'deu'
  const [targetLanguage, setTargetLanguage] = usePersistedTargetLanguage(
    sourceLanguageCode,
    'eng',
  )
  const translation = useTranslation(
    debouncedToken,
    sourceLanguageCode,
    targetLanguage,
    500,
  )

  return (
    <>
      <div className="flex justify-between items-center space-x-2">
        <input
          type="text"
          className="bg-gray-100 w-full text-2xl border-0 h-10 !ring-offset-0 !ring-0w"
          defaultValue={token}
          onChange={e => setToken(e.currentTarget.value.trim())}
        />
        <LanguageSelect
          targetLanguage={targetLanguage}
          setTargetLanguage={setTargetLanguage}
          availableLanguages={[
            { code: 'eng', description: 'EN' },
            { code: 'nld', description: 'NL' },
          ]}
        />
      </div>
      <a
        href="#"
        onClick={() => {
          initCardCreationFlow({
            sourceText: token,
            meta: {
              meaning: translation.data,
            },
            sourceLanguage: 'deu',
            initialCropArea,
          })
        }}
        className="flex justify-between items-center p-2 mt-2 hover:bg-gray-100"
      >
        <span className="text-2xl group">
          {translation.isLoading ? 'Loading' : null}
          {translation.isError
            ? `Error loading translation: ${translation.error.message}`
            : null}
          {translation.data ? translation.data : null}
        </span>
        <ArrowRightEndOnRectangleIcon className="h-7 w-7" />
      </a>

      <a
        href="#"
        onClick={e => {
          e.stopPropagation()
          close()
        }}
        className="text-red-900 hover:bg-gray-100 border flex justify-center items-center px-4 py-2 mt-4"
      >
        <span>Close</span>
      </a>
    </>
  )
}

const GermanMangaReader: NextPage<{}> = () => {
  return (
    <MangaReader
      useVertical={false}
      PopupEditor={GermanPopupEditor}
      createCard={async ({ token, image, meta }) =>
        await createPendingCard({
          id: undefined,
          language_code: 'deu',
          token,
          source_image: image,
          meta: {
            card_type: 'sentence',
            ...meta,
          },
        })
      }
    />
  )
}

export default GermanMangaReader
