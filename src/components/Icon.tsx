type IconProps = {
  children: string
  className?: string
}

function Icon({ children, className = '' }: IconProps) {
  return <span className={`material-symbols-outlined ${className}`}>{children}</span>
}

export default Icon
