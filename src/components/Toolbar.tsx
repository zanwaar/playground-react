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
const defaultFontSize = 11
const minFontSize = 6
const maxFontSize = 96
const textColorPalette = ['#1c1b1f', '#5f6368', '#d93025', '#e37400', '#188038', '#1a73e8', '#673ab7', '#c2185b']
const maxTablePickerRows = 8
const maxTablePickerCols = 8
type TableInsertMode = 'table' | 'grid'

function Toolbar({ editor }: ToolbarProps) {
  const [, setEditorStateVersion] = useState(0)
  const [isTableMenuOpen, setIsTableMenuOpen] = useState(false)
  const [isTextColorMenuOpen, setIsTextColorMenuOpen] = useState(false)
  const [selectedFontSize, setSelectedFontSize] = useState(String(defaultFontSize))
  const [selectedTextColor, setSelectedTextColor] = useState(defaultTextColor)
  const [tableInsertMode, setTableInsertMode] = useState<TableInsertMode>('table')
  const [tablePickerSize, setTablePickerSize] = useState({ rows: 3, cols: 3 })
  const selectedTextRange = useRef<{ from: number; to: number } | null>(null)

  useEffect(() => {
    if (!editor) return undefined

    const updateSelectedTextRange = () => {
      const { from, to, empty } = editor.state.selection

      if (!empty) {
        selectedTextRange.current = { from, to }
      }

      const textSize = editor.getAttributes('textSize').size
      const fontSize = typeof textSize === 'string' ? Number.parseFloat(textSize) : Number.NaN

      setSelectedFontSize(Number.isFinite(fontSize) ? String(fontSize) : String(defaultFontSize))

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

    if (!editor.isFocused && editor.state.selection.empty && selectedTextRange.current) {
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
      format_align_left: () => commandChain()?.focus().setTextAlign('left').run() ?? false,
      format_align_center: () => commandChain()?.focus().setTextAlign('center').run() ?? false,
      format_align_right: () => commandChain()?.focus().setTextAlign('right').run() ?? false,
      format_align_justify: () => commandChain()?.focus().setTextAlign('justify').run() ?? false,
      format_list_bulleted: () => commandChain()?.focus().toggleBulletList().run() ?? false,
      format_list_numbered: () => commandChain()?.focus().toggleOrderedList().run() ?? false,
      format_quote: () => commandChain()?.focus().toggleBlockquote().run() ?? false,
      horizontal_rule: () => commandChain()?.focus().setHorizontalRule().run() ?? false,
    }

    commands[icon]?.()
  }

  const applyTextColor = (color: string) => {
    setSelectedTextColor(color)
    commandChain()?.focus().setTextColor(color).run()
    setIsTextColorMenuOpen(false)
  }

  const clearTextColor = () => {
    commandChain()?.focus().unsetTextColor().run()
    setIsTextColorMenuOpen(false)
  }

  const applyFontSize = (size: number) => {
    const nextSize = Number.isFinite(size) ? Math.min(maxFontSize, Math.max(minFontSize, size)) : defaultFontSize

    setSelectedFontSize(String(nextSize))
    commandChain()?.focus().setTextSize(`${nextSize}px`).run()
  }

  const changeFontSize = (delta: number) => {
    const currentSize = Number.parseFloat(selectedFontSize)

    applyFontSize((Number.isFinite(currentSize) ? currentSize : defaultFontSize) + delta)
  }

  const insertTable = (rows: number, cols: number) => {
    if (tableInsertMode === 'grid') {
      commandChain()?.focus().insertGrid({ rows, cols }).run()
    } else {
      commandChain()?.focus().insertTable({ rows, cols, withHeaderRow: true }).run()
    }

    setIsTableMenuOpen(false)
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
    setIsTableMenuOpen(false)
  }

  const isActive = (icon: string) => {
    if (!editor) return false

    const activeStates: Record<string, boolean> = {
      format_bold: editor.isActive('bold'),
      format_italic: editor.isActive('italic'),
      format_underlined: editor.isActive('underline'),
      strikethrough_s: editor.isActive('strike'),
      code: editor.isActive('code'),
      format_color_text: editor.isActive('textColor'),
      format_align_left: editor.isActive({ textAlign: 'left' }) || !['center', 'right', 'justify'].some((textAlign) => editor.isActive({ textAlign })),
      format_align_center: editor.isActive({ textAlign: 'center' }),
      format_align_right: editor.isActive({ textAlign: 'right' }),
      format_align_justify: editor.isActive({ textAlign: 'justify' }),
      format_list_bulleted: editor.isActive('bulletList'),
      format_list_numbered: editor.isActive('orderedList'),
      format_quote: editor.isActive('blockquote'),
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
        <button
          className="tool-button tool-button--compact"
          disabled={!editor}
          onMouseDown={(event) => {
            event.preventDefault()
            changeFontSize(-1)
          }}
          type="button"
        ><Icon>remove</Icon></button>
        <input
          aria-label="Font size"
          disabled={!editor}
          max={maxFontSize}
          min={minFontSize}
          onBlur={() => applyFontSize(Number.parseFloat(selectedFontSize))}
          onChange={(event) => setSelectedFontSize(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              applyFontSize(Number.parseFloat(selectedFontSize))
            }
          }}
          type="number"
          value={selectedFontSize}
        />
        <button
          className="tool-button tool-button--compact"
          disabled={!editor}
          onMouseDown={(event) => {
            event.preventDefault()
            changeFontSize(1)
          }}
          type="button"
        ><Icon>add</Icon></button>
      </div>
      <Divider />
      {formattingActions.map((item, index) => (
        <span className="toolbar-group" key={item.icon}>
          {[6, 10].includes(index) && <Divider />}
          {item.icon === 'format_color_text' ? (
            <div className="text-color-dropdown">
              <button
                className={`tool-button text-color-trigger ${isActive(item.icon) || isTextColorMenuOpen ? 'tool-button--active' : ''}`}
                disabled={!editor}
                onMouseDown={(event) => {
                  event.preventDefault()
                  setIsTextColorMenuOpen((isOpen) => !isOpen)
                  setIsTableMenuOpen(false)
                }}
                title={item.title}
                type="button"
              >
                <Icon className={item.highlighted ? 'icon-primary' : ''}>{item.icon}</Icon>
                <span className="text-color-swatch" style={{ backgroundColor: selectedTextColor }} />
              </button>
              {isTextColorMenuOpen && editor && (
                <div className="text-color-menu" role="menu">
                  <div className="text-color-menu__label">Text color</div>
                  <div className="text-color-palette">
                    {textColorPalette.map((color) => (
                      <button
                        aria-label={`Set text color ${color}`}
                        className="text-color-option"
                        key={color}
                        onMouseDown={(event) => {
                          event.preventDefault()
                          applyTextColor(color)
                        }}
                        style={{ backgroundColor: color }}
                        type="button"
                      />
                    ))}
                  </div>
                  <label className="text-color-custom">
                    <span>Custom</span>
                    <input
                      aria-label="Custom text color"
                      type="color"
                      value={selectedTextColor}
                      onChange={(event) => applyTextColor(event.target.value)}
                    />
                  </label>
                  <button
                    className="text-color-clear"
                    onMouseDown={(event) => {
                      event.preventDefault()
                      clearTextColor()
                    }}
                    type="button"
                  >
                    Clear color
                  </button>
                </div>
              )}
            </div>
          ) : (
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
          )}
        </span>
      ))}
      <Divider />
      <div className="table-actions-dropdown">
        <button
          className={`tool-button table-actions-trigger ${isTableMenuOpen ? 'tool-button--active' : ''}`}
          disabled={!editor}
          onMouseDown={(event) => {
            event.preventDefault()
            setIsTableMenuOpen((isOpen) => !isOpen)
            setIsTextColorMenuOpen(false)
          }}
          title="Table"
          type="button"
        >
          <Icon>table_chart</Icon>
          <Icon>arrow_drop_down</Icon>
        </button>
        {isTableMenuOpen && editor && (
          <div className="table-actions-menu" role="menu" onMouseLeave={() => setTablePickerSize({ rows: 3, cols: 3 })}>
            <div className="table-insert-mode" aria-label="Table insert mode">
              <button
                className={`table-insert-mode__button ${tableInsertMode === 'table' ? 'table-insert-mode__button--active' : ''}`}
                onMouseDown={(event) => {
                  event.preventDefault()
                  setTableInsertMode('table')
                }}
                type="button"
              >
                Table
              </button>
              <button
                className={`table-insert-mode__button ${tableInsertMode === 'grid' ? 'table-insert-mode__button--active' : ''}`}
                onMouseDown={(event) => {
                  event.preventDefault()
                  setTableInsertMode('grid')
                }}
                type="button"
              >
                Grid
              </button>
            </div>
            <div className="table-picker-label">
              Insert {tableInsertMode} {tablePickerSize.rows} × {tablePickerSize.cols}
            </div>
            <div className="table-picker-grid" aria-label="Table size picker">
              {Array.from({ length: maxTablePickerRows }, (_, rowIndex) => (
                <div className="table-picker-row" key={rowIndex}>
                  {Array.from({ length: maxTablePickerCols }, (_, colIndex) => {
                    const rows = rowIndex + 1
                    const cols = colIndex + 1
                    const isSelected = rows <= tablePickerSize.rows && cols <= tablePickerSize.cols

                    return (
                      <button
                        aria-label={`Insert ${rows} by ${cols} table`}
                        className={`table-picker-cell ${isSelected ? 'table-picker-cell--selected' : ''}`}
                        key={`${rows}-${cols}`}
                        onMouseDown={(event) => {
                          event.preventDefault()
                          insertTable(rows, cols)
                        }}
                        onMouseEnter={() => setTablePickerSize({ rows, cols })}
                        type="button"
                      />
                    )
                  })}
                </div>
              ))}
            </div>
            <div className="table-actions-menu__divider" />
            {tableActions.map((item) => (
              <button
                className="table-actions-menu__item"
                disabled={!editor.isActive('table')}
                key={item.command}
                onMouseDown={(event) => {
                  event.preventDefault()
                  runTableAction(item.command)
                }}
                role="menuitem"
                type="button"
              >
                <Icon>{item.icon}</Icon>
                <span>{item.title}</span>
              </button>
            ))}
          </div>
        )}
      </div>
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
