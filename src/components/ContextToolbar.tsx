import Icon from './Icon'

type ContextToolbarProps = {
  position: { x: number; y: number }
  visible: boolean
}

function ContextToolbar({ position, visible }: ContextToolbarProps) {
  return (
    <div className={`context-toolbar ${visible ? 'context-toolbar--visible' : ''}`} style={{ left: position.x, top: position.y }}>
      {['format_bold', 'format_italic', 'link', 'add_comment'].map((icon) => (
        <button key={icon} onMouseDown={(event) => event.preventDefault()} type="button">
          <Icon>{icon}</Icon>
        </button>
      ))}
    </div>
  )
}

export default ContextToolbar
