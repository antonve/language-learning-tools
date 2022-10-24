export const Button = ({
  onClick,
  children,
  className,
}: {
  onClick: () => void
  children: React.ReactNode
  className?: string
}) => (
  <button
    onClick={onClick}
    className={`bg-transparent hover:bg-gray-500 text-gray-700 font-semibold hover:text-white py-2 px-4 border-gray-500 ${className}`}
  >
    {children}
  </button>
)
