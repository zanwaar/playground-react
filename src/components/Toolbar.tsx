import type { Editor } from '@tiptap/react'
import { formattingActions, toolbarLeft } from '../data/editorData'
import Icon from './Icon'

function Divider() {
  return <div className="divider" />
}

function DropdownLabel({ label }: { label: string }) {
  return (
    <button className="dropdown-label" type="button">
      <span>{label}</span>
      <Icon>arrow_drop_down</Icon>
    </button>
  )
}

type ToolbarProps = {
  editor: Editor | null
}

function Toolbar({ editor }: ToolbarProps) {
  const runHistoryAction = (icon: string) => {
    if (!editor) return
    if (icon === 'undo') editor.chain().focus().undo().run()
    if (icon === 'redo') editor.chain().focus().redo().run()
  }

  const runFormattingAction = (icon: string) => {
    if (!editor) return

    const commands: Record<string, () => boolean> = {
      format_bold: () => editor.chain().focus().toggleBold().run(),
      format_italic: () => editor.chain().focus().toggleItalic().run(),
      format_align_left: () => editor.chain().focus().setWordTextAlign('left').run(),
      format_align_center: () => editor.chain().focus().setWordTextAlign('center').run(),
      format_align_right: () => editor.chain().focus().setWordTextAlign('right').run(),
      format_align_justify: () => editor.chain().focus().setWordTextAlign('justify').run(),
      format_line_spacing: () => editor.chain().focus().toggleBulletList().run(),
    }

    commands[icon]?.()
  }

  const isActive = (icon: string) => {
    if (!editor) return false

    const activeStates: Record<string, boolean> = {
      format_bold: editor.isActive('bold'),
      format_italic: editor.isActive('italic'),
      format_align_left: editor.isActive({ textAlign: 'left' }) || !['center', 'right', 'justify'].some((textAlign) => editor.isActive({ textAlign })),
      format_align_center: editor.isActive({ textAlign: 'center' }),
      format_align_right: editor.isActive({ textAlign: 'right' }),
      format_align_justify: editor.isActive({ textAlign: 'justify' }),
      format_line_spacing: editor.isActive('bulletList'),
    }

    return activeStates[icon] ?? false
  }

  return (
    <section className="toolbar" aria-label="Editor toolbar">
      {toolbarLeft.map((item) => (
        <button className="tool-button" disabled={!editor || !['undo', 'redo'].includes(item.icon)} key={item.icon} onClick={() => runHistoryAction(item.icon)} title={item.title} type="button">
          <Icon>{item.icon}</Icon>
        </button>
      ))}
      <Divider />
      <DropdownLabel label="Normal text" />
      <Divider />
      <DropdownLabel label="Arial" />
      <Divider />
      <div className="font-size-control">
        <button className="tool-button tool-button--compact" type="button"><Icon>remove</Icon></button>
        <input aria-label="Font size" defaultValue="11" />
        <button className="tool-button tool-button--compact" type="button"><Icon>add</Icon></button>
      </div>
      <Divider />
      {formattingActions.map((item, index) => (
        <span className="toolbar-group" key={item.icon}>
          {index === 4 && <Divider />}
          <button className={`tool-button ${isActive(item.icon) ? 'tool-button--active' : ''}`} disabled={!editor || item.icon === 'format_underlined' || item.icon === 'format_color_text'} onClick={() => runFormattingAction(item.icon)} title={item.title} type="button">
            <Icon className={item.highlighted ? 'icon-primary' : ''}>{item.icon}</Icon>
          </button>
        </span>
      ))}
      <div className="toolbar-spacer" />
      <button className="tool-button" onClick={() => editor?.chain().focus().insertPage({ pageType: 'body' }).run()} type="button"><Icon>note_add</Icon></button>
      <button className="tool-button" type="button"><Icon>keyboard_arrow_up</Icon></button>
    </section>
  )
}

export default Toolbar
