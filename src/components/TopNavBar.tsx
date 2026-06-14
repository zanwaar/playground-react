import type { JSONContent } from '@tiptap/core'
import type { Editor } from '@tiptap/react'
import { useEffect, useRef, useState } from 'react'
import { navItems, quickActions } from '../data/editorData'
import Icon from './Icon'
import { mergeSplitWordParagraphs } from 'tiptap-docs-kit'

interface TopNavBarProps {
  editor: Editor | null
}

type PageSetup = {
  paperSize: 'a4' | 'letter'
  orientation: 'portrait' | 'landscape'
  margin: 'normal' | 'narrow' | 'wide'
}

const pageSetupOptions = {
  paperSize: [
    { label: 'A4', value: 'a4' },
    { label: 'Letter', value: 'letter' },
  ],
  orientation: [
    { label: 'Potret', value: 'portrait' },
    { label: 'Lanskap', value: 'landscape' },
  ],
  margin: [
    { label: 'Normal', value: 'normal' },
    { label: 'Sempit', value: 'narrow' },
    { label: 'Lebar', value: 'wide' },
  ],
} as const

const isJsonContent = (value: unknown): value is JSONContent => {
  if (!value || typeof value !== 'object') return false

  const content = value as JSONContent
  return typeof content.type === 'string'
}

const downloadJsonFile = (content: JSONContent) => {
  const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = `word-editor-${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

function TopNavBar({ editor }: TopNavBarProps) {
  const [activeTab, setActiveTab] = useState(navItems[0])
  const [importError, setImportError] = useState('')
  const [isPageSetupOpen, setIsPageSetupOpen] = useState(false)
  const [pageSetup, setPageSetup] = useState<PageSetup>({ paperSize: 'a4', orientation: 'portrait', margin: 'normal' })
  const pageSetupRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!isPageSetupOpen) return undefined

    const closePageSetup = (event: PointerEvent) => {
      const target = event.target as Node
      if (!pageSetupRef.current?.contains(target)) setIsPageSetupOpen(false)
    }

    document.addEventListener('pointerdown', closePageSetup)
    return () => document.removeEventListener('pointerdown', closePageSetup)
  }, [isPageSetupOpen])

  useEffect(() => {
    if (!editor) return undefined

    const updatePageSetup = () => {
      const attrs = editor.getAttributes('page')

      setPageSetup({
        paperSize: attrs.paperSize === 'letter' ? 'letter' : 'a4',
        orientation: attrs.orientation === 'landscape' ? 'landscape' : 'portrait',
        margin: attrs.margin === 'narrow' || attrs.margin === 'wide' ? attrs.margin : 'normal',
      })
    }

    editor.on('selectionUpdate', updatePageSetup)
    editor.on('transaction', updatePageSetup)
    updatePageSetup()

    return () => {
      editor.off('selectionUpdate', updatePageSetup)
      editor.off('transaction', updatePageSetup)
    }
  }, [editor])

  const applyPageSetup = (nextPageSetup: PageSetup) => {
    if (!editor) return

    setPageSetup(nextPageSetup)

    const transaction = editor.state.tr
    editor.state.doc.forEach((node, offset) => {
      if (node.type.name !== 'page') return

      transaction.setNodeMarkup(offset, undefined, {
        ...node.attrs,
        ...nextPageSetup,
      })
    })

    if (transaction.docChanged) {
      editor.view.dispatch(transaction.scrollIntoView())
    }

    mergeSplitWordParagraphs(editor)
  }

  const exportJson = () => {
    if (!editor) return

    setImportError('')
    downloadJsonFile(editor.getJSON())
  }

  const importJson = async (file: File | null) => {
    if (!editor || !file) return

    setImportError('')

    try {
      const parsedJson = JSON.parse(await file.text()) as unknown
      if (!isJsonContent(parsedJson)) {
        setImportError('Invalid editor JSON file')
        return
      }

      editor.commands.setContent(parsedJson)
      editor.commands.focus('start')
    } catch {
      setImportError('Could not read JSON file')
    }
  }

  return (
    <header className="top-nav">
      <div className="top-nav__row">
        <div className="brand-cluster">
          <div className="brand-icon">
            <Icon>description</Icon>
          </div>
          <div className="document-heading">
            <div className="title-row">
              <h1>Untitled document</h1>
              {['star', 'drive_file_move', 'cloud_done'].map((icon) => (
                <button className="ghost-icon ghost-icon--small" key={icon} type="button">
                  <Icon>{icon}</Icon>
                </button>
              ))}
            </div>
            <nav className="menu-tabs" aria-label="Document menu">
              {navItems.map((item) => (
                <button
                  className={`menu-tab ${activeTab === item ? 'menu-tab--active' : ''}`}
                  key={item}
                  onClick={() => setActiveTab(item)}
                  type="button"
                >
                  {item}
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="top-actions">
          <div className="page-setup" ref={pageSetupRef}>
            <button
              className={`page-setup-trigger ${isPageSetupOpen ? 'page-setup-trigger--active' : ''}`}
              disabled={!editor}
              onMouseDown={(event) => {
                event.preventDefault()
                setIsPageSetupOpen((isOpen) => !isOpen)
                setImportError('')
              }}
              type="button"
            >
              <Icon>article</Icon>
              Pengaturan Halaman
            </button>
            {isPageSetupOpen && editor && (
              <div className="page-setup-panel" role="dialog" aria-label="Pengaturan Halaman">
                <div>
                  <h2>Pengaturan Halaman</h2>
                  <p>Atur ukuran kertas, orientasi, dan margin.</p>
                </div>
                <label>
                  <span>Ukuran kertas</span>
                  <select
                    value={pageSetup.paperSize}
                    onChange={(event) => applyPageSetup({ ...pageSetup, paperSize: event.target.value as PageSetup['paperSize'] })}
                  >
                    {pageSetupOptions.paperSize.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                </label>
                <label>
                  <span>Orientasi</span>
                  <select
                    value={pageSetup.orientation}
                    onChange={(event) => applyPageSetup({ ...pageSetup, orientation: event.target.value as PageSetup['orientation'] })}
                  >
                    {pageSetupOptions.orientation.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                </label>
                <label>
                  <span>Margin</span>
                  <select
                    value={pageSetup.margin}
                    onChange={(event) => applyPageSetup({ ...pageSetup, margin: event.target.value as PageSetup['margin'] })}
                  >
                    {pageSetupOptions.margin.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                </label>
              </div>
            )}
          </div>
          <div className="json-actions" aria-label="JSON file actions">
            <label className={`json-action ${!editor ? 'json-action--disabled' : ''}`}>
              <Icon>upload_file</Icon>
              Import JSON
              <input
                accept="application/json,.json"
                disabled={!editor}
                onChange={(event) => {
                  void importJson(event.target.files?.[0] ?? null)
                  event.currentTarget.value = ''
                }}
                type="file"
              />
            </label>
            <button className="json-action" disabled={!editor} onClick={exportJson} type="button">
              <Icon>download</Icon>
              Export JSON
            </button>
          </div>
          <div className="quick-actions">
            {quickActions.map((icon) => (
              <button className="ghost-icon" key={icon} type="button">
                <Icon>{icon}</Icon>
              </button>
            ))}
          </div>
          <button className="share-button" type="button">
            <Icon>lock</Icon>
            Share
          </button>
          <img
            alt="User profile"
            className="avatar"
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=96&q=80"
          />
        </div>
      </div>
      {importError && <div className="json-error" role="alert">{importError}</div>}
    </header>
  )
}

export default TopNavBar
