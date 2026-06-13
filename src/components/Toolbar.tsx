import type { Editor } from '@tiptap/react'
import { useEffect, useRef, useState } from 'react'
import { formattingActions, tableActions, toolbarLeft } from '../data/editorData'
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

const defaultTextColor = '#063f81'

function Toolbar({ editor }: ToolbarProps) {
  const [, setEditorStateVersion] = useState(0)
  const selectedTextRange = useRef<{ from: number; to: number } | null>(null)

  useEffect(() => {
    if (!editor) return undefined

    const updateSelectedTextRange = () => {
      const { from, to, empty } = editor.state.selection

      if (!empty) {
        selectedTextRange.current = { from, to }
      }

      setEditorStateVersion((version) => version + 1)
    }

    editor.on('selectionUpdate', updateSelectedTextRange)
    editor.on('transaction', updateSelectedTextRange)
    updateSelectedTextRange()

    return () => {
      editor.off('selectionUpdate', updateSelectedTextRange)
      editor.off('transaction', updateSelectedTextRange)
    }
  }, [editor])

  const commandChain = () => {
    const chain = editor?.chain()
    if (!editor || !chain) return null

    if (editor.state.selection.empty && selectedTextRange.current) {
      chain.setTextSelection(selectedTextRange.current)
    }

    return chain
  }

  const runHistoryAction = (icon: string) => {
    if (!editor) return
    if (icon === 'undo') commandChain()?.undo().focus().run()
    if (icon === 'redo') commandChain()?.redo().focus().run()
  }

  const runFormattingAction = (icon: string) => {
    if (!editor) return

    const commands: Record<string, () => boolean> = {
      format_bold: () => commandChain()?.focus().toggleBold().run() ?? false,
      format_italic: () => commandChain()?.focus().toggleItalic().run() ?? false,
      format_underlined: () => commandChain()?.focus().toggleUnderline().run() ?? false,
      strikethrough_s: () => commandChain()?.focus().toggleStrike().run() ?? false,
      code: () => commandChain()?.focus().toggleCode().run() ?? false,
      format_color_text: () => commandChain()?.focus().setTextColor(defaultTextColor).run() ?? false,
      format_align_left: () => commandChain()?.focus().setTextAlign('left').run() ?? false,
      format_align_center: () => commandChain()?.focus().setTextAlign('center').run() ?? false,
      format_align_right: () => commandChain()?.focus().setTextAlign('right').run() ?? false,
      format_align_justify: () => commandChain()?.focus().setTextAlign('justify').run() ?? false,
      format_list_bulleted: () => commandChain()?.focus().toggleBulletList().run() ?? false,
      format_list_numbered: () => commandChain()?.focus().toggleOrderedList().run() ?? false,
      format_quote: () => commandChain()?.focus().toggleBlockquote().run() ?? false,
      horizontal_rule: () => commandChain()?.focus().setHorizontalRule().run() ?? false,
      table: () => commandChain()?.focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run() ?? false,
    }

    commands[icon]?.()
  }

  const runTableAction = (command: string) => {
    if (!editor) return

    const commands: Record<string, () => boolean> = {
      addColumnAfter: () => commandChain()?.focus().addColumnAfter().run() ?? false,
      addRowAfter: () => commandChain()?.focus().addRowAfter().run() ?? false,
      deleteColumn: () => commandChain()?.focus().deleteColumn().run() ?? false,
      deleteRow: () => commandChain()?.focus().deleteRow().run() ?? false,
      deleteTable: () => commandChain()?.focus().deleteTable().run() ?? false,
    }

    commands[command]?.()
  }

  const isActive = (icon: string) => {
    if (!editor) return false

    const activeStates: Record<string, boolean> = {
      format_bold: editor.isActive('bold'),
      format_italic: editor.isActive('italic'),
      format_underlined: editor.isActive('underline'),
      strikethrough_s: editor.isActive('strike'),
      code: editor.isActive('code'),
      format_color_text: editor.isActive('textColor', { color: defaultTextColor }),
      format_align_left: editor.isActive({ textAlign: 'left' }) || !['center', 'right', 'justify'].some((textAlign) => editor.isActive({ textAlign })),
      format_align_center: editor.isActive({ textAlign: 'center' }),
      format_align_right: editor.isActive({ textAlign: 'right' }),
      format_align_justify: editor.isActive({ textAlign: 'justify' }),
      format_list_bulleted: editor.isActive('bulletList'),
      format_list_numbered: editor.isActive('orderedList'),
      format_quote: editor.isActive('blockquote'),
      table: editor.isActive('table'),
    }

    return activeStates[icon] ?? false
  }

  return (
    <section className="toolbar" aria-label="Editor toolbar">
      {toolbarLeft.map((item) => (
        <button
          className="tool-button"
          disabled={!editor || !['undo', 'redo'].includes(item.icon)}
          key={item.icon}
          onMouseDown={(event) => {
            event.preventDefault()
            runHistoryAction(item.icon)
          }}
          title={item.title}
          type="button"
        >
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
          {[6, 10].includes(index) && <Divider />}
          <button
            className={`tool-button ${isActive(item.icon) ? 'tool-button--active' : ''}`}
            disabled={!editor}
            onMouseDown={(event) => {
              event.preventDefault()
              runFormattingAction(item.icon)
            }}
            title={item.title}
            type="button"
          >
            <Icon className={item.highlighted ? 'icon-primary' : ''}>{item.icon}</Icon>
          </button>
        </span>
      ))}
      <Divider />
      {tableActions.map((item) => (
        <button
          className="tool-button"
          disabled={!editor || !editor.isActive('table')}
          key={item.command}
          onMouseDown={(event) => {
            event.preventDefault()
            runTableAction(item.command)
          }}
          title={item.title}
          type="button"
        >
          <Icon>{item.icon}</Icon>
        </button>
      ))}
      <div className="toolbar-spacer" />
      <button
        className="tool-button"
        onMouseDown={(event) => {
          event.preventDefault()
          commandChain()?.focus().insertPage({ pageType: 'body' }).run()
        }}
        type="button"
      ><Icon>note_add</Icon></button>
      <button className="tool-button" type="button"><Icon>keyboard_arrow_up</Icon></button>
    </section>
  )
}

export default Toolbar
