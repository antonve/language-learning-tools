import { FC } from 'react'

interface Props {
  onClick?: () => void
}

const Button: FC<Props> = ({ children, onClick }) => (
  <button
    className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
    onClick={onClick}
  >
    {children}
  </button>
)

export default Button
