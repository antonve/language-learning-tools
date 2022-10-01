import { Fragment } from 'react'
import { Tab } from '@headlessui/react'

interface Props {
  selectedLanguage: string
  languages: string[]
}

const LanguageToggle = ({ selectedLanguage, languages}: Props) => (
  <div className='w-full max-w-md px-2 sm:px-0 bg-red-200'>
    <Tab.List className="flex p-1 space-x-1 bg-blue-900/20 rounded-xl">
      {languages.map((lang) => (
        <Tab as={Fragment}>
            {({ selected }) => (
              <button
                className={
                  selected ? 'bg-blue-500 text-white' : 'bg-white text-black'
                }
              >
                {lang}
              </button>
            )}
          </Tab>
      ))}
    </Tab.List>
  </div>
)

export default LanguageToggle
