import type { Editor } from '@tiptap/react'
import Icon from './Icon'

type ContextToolbarProps = {
  editor: Editor | null
  position: { x: number; y: number }
  visible: boolean
}

function ContextToolbar({ editor, position, visible }: ContextToolbarProps) {
  const actions = [
    { icon: 'format_bold', command: () => editor?.chain().focus().toggleBold().run() },
    { icon: 'format_italic', command: () => editor?.chain().focus().toggleItalic().run() },
    { icon: 'format_list_bulleted', command: () => editor?.chain().focus().toggleBulletList().run() },
    { icon: 'add_comment', command: () => editor?.chain().focus().setParagraph().run() },
  ]

  return (
    <div className={`context-toolbar ${visible ? 'context-toolbar--visible' : ''}`} style={{ left: position.x, top: position.y }}>
      {actions.map((action) => (
        <button
          key={action.icon}
          onMouseDown={(event) => {
            event.preventDefault()
            action.command()
          }}
          type="button"
        >
          <Icon>{action.icon}</Icon>
        </button>
      ))}
    </div>
  )
}

export default ContextToolbar
