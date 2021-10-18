import { FC } from 'react'

export const RadioButton: FC<{
  value: boolean
  onChange: (value: boolean) => void
}> = ({ value, onChange }) => (
  <input
    type="radio"
    className={`rounded-full`}
    checked={value}
    onChange={() => onChange(!value)}
  />
)

export const Input: FC<{
  value: string | undefined
  onChange: (value: string) => void
  id: string | undefined
}> = ({ value, onChange, id }) => (
  <input
    type="text"
    className={
      'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50'
    }
    id={id}
    value={value ?? ''}
    onChange={event => {
      const updatedValue = event.target.value
      onChange(updatedValue)
    }}
  />
)

export const Label: FC<{
  htmlFor: string | undefined
}> = ({ htmlFor, children }) => (
  <label htmlFor={htmlFor} className={'text-gray-700'}>
    {children}
  </label>
)

export const TextArea: FC<{
  value: string | undefined
  onChange: (value: string) => void
  id: string | undefined
  rows: number | undefined
}> = ({ value, onChange, id, rows }) => (
  <textarea
    type="text"
    className={
      'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50'
    }
    id={id}
    value={value ?? ''}
    onChange={event => {
      const updatedValue = event.target.value
      onChange(updatedValue)
    }}
    rows={rows ?? 3}
  />
)