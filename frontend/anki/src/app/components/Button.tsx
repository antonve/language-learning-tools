import { FC } from 'react'
import classNames from 'classnames'

interface Props {
  onClick?: () => void
  primary?: boolean
}

const Button: FC<Props> = ({ children, onClick, primary }) => (
  <button
    className={classNames('font-bold py-2 px-4 rounded border-2', {
      'text-white bg-purple-500 hover:bg-purple-700 border-transparent': !!primary,
      'border-gray-800 text-gray-800': !primary,
    })}
    onClick={onClick}
  >
    {children}
  </button>
)

export default Button
