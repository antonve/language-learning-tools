export const Button = ({
  onClick,
  children,
  className,
  disabled = false,
}: {
  onClick: () => void
  children: React.ReactNode
  className?: string
  disabled?: boolean
}) => (
  <button
    onClick={onClick}
    className={`bg-transparent hover:bg-gray-500 text-gray-700 font-semibold hover:text-white py-2 px-4 border-gray-500 ${
      disabled ? 'opacity-50' : ''
    } ${className}`}
    disabled={disabled}
  >
    {children}
  </button>
)

export const ButtonLink = ({
  href,
  children,
  className,
  target,
  disabled = false,
}: {
  href: string
  children: React.ReactNode
  className?: string
  target?: string
  disabled?: boolean
}) => (
  <a
    href={href}
    target={target}
    className={`text-center bg-transparent hover:bg-gray-500 text-gray-700 font-semibold hover:text-white py-2 px-4 border-gray-500 ${
      disabled ? 'opacity-50' : ''
    } ${className}`}
  >
    {children}
  </a>
)
