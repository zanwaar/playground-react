import type { JSONContent } from '@tiptap/core'
import type { Editor } from '@tiptap/react'
import { useState } from 'react'
import { navItems, quickActions } from '../data/editorData'
import Icon from './Icon'

interface TopNavBarProps {
  editor: Editor | null
}

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
