import { FC, ReactNode } from 'react'
import classNames from 'classnames'

interface Props {
  onClick?: () => void
  primary?: boolean
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  overrides?: string
  children?: ReactNode
}

const Button: FC<Props> = ({
  children,
  onClick,
  primary,
  type,
  overrides,
  disabled,
}) => (
  <button
    type={type ?? 'button'}
    className={classNames(
      'font-bold py-2 px-4 rounded border-2 hover:opacity-50 transition duration-200 ease-in-out',
      {
        'text-white bg-purple-500 hover:bg-purple-700 border-transparent ':
          !!primary,
        'border-gray-800 text-gray-800 dark:text-purple-300 dark:border-purple-300':
          !primary,
        'opacity-50': disabled,
      },
      overrides,
    )}
    onClick={onClick}
    disabled={disabled}
  >
    {children}
  </button>
)

export const ButtonLink: FC<{
  href: string
  primary?: boolean
  overrides?: string
  children?: ReactNode
}> = ({ children, href, primary, overrides }) => (
  <a
    className={classNames(
      'font-bold py-2 px-4 rounded border-2 hover:opacity-50 transition duration-200 ease-in-out',
      {
        'text-white bg-purple-500 hover:bg-purple-700 border-transparent ':
          !!primary,
        'border-gray-800 text-gray-800 dark:text-purple-300 dark:border-purple-300':
          !primary,
      },
      overrides,
    )}
    href={href}
  >
    {children}
  </a>
)

export default Button
