import { Language } from '@app/domain'
import Link from 'next/link'

interface Props {
  languages: Language[]
  selectedLanguageCode: string
}

const LanguageToggle = ({ languages, selectedLanguageCode }: Props) => (
  <div className="w-full max-w-md ">
    <div className="flex p-1 space-x-1 bg-purple-400 bg-opacity-10 rounded-xl flex">
      {languages.map(lang => (
        <Link key={lang.code} href={`/${lang.code}`}>
          <a
            className={`w-full rounded-lg py-2.5 text-sm font-medium leading-5 bg-white shadow text-center ${
              lang.code === selectedLanguageCode
                ? 'bg-purple-500 text-white'
                : 'bg-white text-purple-500'
            }`}
          >
            {lang.name}
          </a>
        </Link>
      ))}
    </div>
  </div>
)

export default LanguageToggle
