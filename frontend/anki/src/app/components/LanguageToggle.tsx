import { Fragment } from 'react'
import { Tab } from '@headlessui/react'
import { Language } from '@app/domain'

interface Props {
  languages: Language[]
}

const LanguageToggle = ({ languages }: Props) => (
  <div className="w-full max-w-md ">
    <Tab.List className="flex p-1 space-x-1 bg-purple-400 bg-opacity-10 rounded-xl flex">
      {languages.map(lang => (
        <Tab as={Fragment} key={lang.code}>
          {({ selected }) => (
            <button
              className={`w-full rounded-lg py-2.5 text-sm font-medium leading-5 bg-white shadow ${
                selected
                  ? 'bg-purple-500 text-white'
                  : 'bg-white text-purple-500'
              }`}
            >
              {lang.name}
            </button>
          )}
        </Tab>
      ))}
    </Tab.List>
  </div>
)

export default LanguageToggle
