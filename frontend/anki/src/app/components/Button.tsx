import { FC } from 'react'
import classNames from 'classnames'

interface Props {
  onClick?: () => void
  primary?: boolean
  type?: 'button' | 'submit' | 'reset'
  overrides?: string
}

const Button: FC<Props> = ({ children, onClick, primary, type, overrides }) => (
  <button
    type={type ?? 'button'}
    className={classNames(
      'font-bold py-2 px-4 rounded border-2 hover:opacity-50 transition duration-200 ease-in-out',
      {
        'text-white bg-purple-500 hover:bg-purple-700 border-transparent':
          !!primary,
        'border-gray-800 text-gray-800': !primary,
      },
      overrides,
    )}
    onClick={onClick}
  >
    {children}
  </button>
)

export default Button
