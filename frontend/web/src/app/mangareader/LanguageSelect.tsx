import { Dispatch, SetStateAction, useEffect, useState } from 'react'

export const usePersistedTargetLanguage = (
  sourceLanguageCode: string,
  defaultLanguageCode: string,
) => {
  const [targetLanguage, setTargetLanguage] = useState(defaultLanguageCode)

  const key = `target_language_${sourceLanguageCode}`
  const persist = (newTargetLanguage: string) => {
    localStorage.setItem(key, newTargetLanguage)
    setTargetLanguage(newTargetLanguage)
  }

  useEffect(() => {
    const persistedTargetLanguage = localStorage.getItem(key)
    if (persistedTargetLanguage !== null) {
      setTargetLanguage(persistedTargetLanguage)
    }
  }, [])

  return [targetLanguage, persist] as [string, Dispatch<SetStateAction<string>>]
}

interface Language {
  code: string
  description: string
}

export function LanguageSelect({
  availableLanguages,
  targetLanguage,
  setTargetLanguage,
}: {
  availableLanguages: Language[]
  targetLanguage: string
  setTargetLanguage: (lang: string) => void
}) {
  return (
    <select
      className="border-none bg-gray-100 h-10"
      value={targetLanguage}
      onChange={e => setTargetLanguage(e.currentTarget.value)}
    >
      {availableLanguages.map(lang => (
        <option value={lang.code}>{lang.description}</option>
      ))}
    </select>
  )
}
