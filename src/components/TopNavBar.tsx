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
  margin: 'normal' | 'narrow' | 'wide' | 'custom'
  marginValue: string | null
}

type MarginSide = 'top' | 'right' | 'bottom' | 'left'
type CustomMargin = Record<MarginSide, number>

const defaultCustomMargin: CustomMargin = { top: 2, right: 1.5, bottom: 1.5, left: 1.5 }

const marginSideFields: { side: MarginSide; label: string }[] = [
  { side: 'top', label: 'Atas' },
  { side: 'bottom', label: 'Bawah' },
  { side: 'left', label: 'Kiri' },
  { side: 'right', label: 'Kanan' },
]

const toCustomMargin = (marginValue: string | null): CustomMargin => {
  if (!marginValue) return defaultCustomMargin

  const parts = marginValue.trim().split(/\s+/).map((part) => Number.parseFloat(part))
  if (parts.length !== 4 || parts.some((value) => !Number.isFinite(value))) return defaultCustomMargin

  const [top, right, bottom, left] = parts
  return { top, right, bottom, left }
}

const toMarginValue = ({ top, right, bottom, left }: CustomMargin): string => `${top}cm ${right}cm ${bottom}cm ${left}cm`

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
    { label: 'Kustom', value: 'custom' },
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
  const [isFileMenuOpen, setIsFileMenuOpen] = useState(false)
  const [pageSetup, setPageSetup] = useState<PageSetup>({ paperSize: 'a4', orientation: 'portrait', margin: 'normal', marginValue: null })
  const pageSetupRef = useRef<HTMLDivElement | null>(null)
  const fileMenuRef = useRef<HTMLDivElement | null>(null)
  const importInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (!isPageSetupOpen && !isFileMenuOpen) return undefined

    const closeMenus = (event: PointerEvent) => {
      const target = event.target as Node
      if (!pageSetupRef.current?.contains(target)) setIsPageSetupOpen(false)
      if (!fileMenuRef.current?.contains(target)) setIsFileMenuOpen(false)
    }

    document.addEventListener('pointerdown', closeMenus)
    return () => document.removeEventListener('pointerdown', closeMenus)
  }, [isPageSetupOpen, isFileMenuOpen])

  useEffect(() => {
    if (!editor) return undefined

    const updatePageSetup = () => {
      const attrs = editor.getAttributes('page')

      const marginValue = typeof attrs.marginValue === 'string' ? attrs.marginValue : null
      const presetMargin = attrs.margin === 'narrow' || attrs.margin === 'wide' ? attrs.margin : 'normal'

      setPageSetup({
        paperSize: attrs.paperSize === 'letter' ? 'letter' : 'a4',
        orientation: attrs.orientation === 'landscape' ? 'landscape' : 'portrait',
        margin: marginValue ? 'custom' : presetMargin,
        marginValue,
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

    const pageAttrs = {
      paperSize: nextPageSetup.paperSize,
      orientation: nextPageSetup.orientation,
      margin: nextPageSetup.margin === 'custom' ? 'normal' : nextPageSetup.margin,
      marginValue: nextPageSetup.margin === 'custom' ? (nextPageSetup.marginValue ?? toMarginValue(defaultCustomMargin)) : null,
    }

    const transaction = editor.state.tr
    editor.state.doc.forEach((node, offset) => {
      if (node.type.name !== 'page') return

      transaction.setNodeMarkup(offset, undefined, {
        ...node.attrs,
        ...pageAttrs,
      })
    })

    if (transaction.docChanged) {
      editor.view.dispatch(transaction.scrollIntoView())
    }

    mergeSplitWordParagraphs(editor)
  }

  const applyMarginSelection = (margin: PageSetup['margin']) => {
    if (margin === 'custom') {
      applyPageSetup({ ...pageSetup, margin, marginValue: pageSetup.marginValue ?? toMarginValue(defaultCustomMargin) })
      return
    }

    applyPageSetup({ ...pageSetup, margin, marginValue: null })
  }

  const applyCustomMarginSide = (side: MarginSide, rawValue: string) => {
    const numericValue = Number.parseFloat(rawValue)
    if (!Number.isFinite(numericValue) || numericValue < 0) return

    const nextMargin = { ...toCustomMargin(pageSetup.marginValue), [side]: numericValue }
    applyPageSetup({ ...pageSetup, margin: 'custom', marginValue: toMarginValue(nextMargin) })
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
                item === 'File' ? (
                  <div className="file-menu" key={item} ref={fileMenuRef}>
                    <button
                      className={`menu-tab ${isFileMenuOpen ? 'menu-tab--active' : ''}`}
                      onClick={() => {
                        setActiveTab(item)
                        setIsFileMenuOpen((isOpen) => !isOpen)
                        setIsPageSetupOpen(false)
                        setImportError('')
                      }}
                      type="button"
                    >
                      {item}
                    </button>
                    {isFileMenuOpen && (
                      <div className="file-menu__list" role="menu">
                        <button
                          className="file-menu__item"
                          disabled={!editor}
                          onClick={() => {
                            setIsFileMenuOpen(false)
                            importInputRef.current?.click()
                          }}
                          role="menuitem"
                          type="button"
                        >
                          <Icon>upload_file</Icon>
                          <span>Import JSON</span>
                        </button>
                        <button
                          className="file-menu__item"
                          disabled={!editor}
                          onClick={() => {
                            setIsFileMenuOpen(false)
                            exportJson()
                          }}
                          role="menuitem"
                          type="button"
                        >
                          <Icon>download</Icon>
                          <span>Export JSON</span>
                        </button>
                        <div className="file-menu__separator" />
                        <button
                          className="file-menu__item"
                          disabled={!editor}
                          onClick={() => {
                            setIsFileMenuOpen(false)
                            setIsPageSetupOpen(true)
                          }}
                          role="menuitem"
                          type="button"
                        >
                          <Icon>article</Icon>
                          <span>Pengaturan Halaman</span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    className={`menu-tab ${activeTab === item ? 'menu-tab--active' : ''}`}
                    key={item}
                    onClick={() => setActiveTab(item)}
                    type="button"
                  >
                    {item}
                  </button>
                )
              ))}
            </nav>
          </div>
        </div>

        <div className="top-actions">
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
      {isPageSetupOpen && editor && (
        <div className="page-setup-overlay" role="presentation" onMouseDown={() => setIsPageSetupOpen(false)}>
          <div
            className="page-setup-panel"
            role="dialog"
            aria-label="Pengaturan Halaman"
            ref={pageSetupRef}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="page-setup-panel__header">
              <div>
                <h2>Pengaturan Halaman</h2>
                <p>Atur ukuran kertas, orientasi, dan margin.</p>
              </div>
              <button
                aria-label="Tutup"
                className="page-setup-panel__close"
                onClick={() => setIsPageSetupOpen(false)}
                type="button"
              >
                <Icon>close</Icon>
              </button>
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
                onChange={(event) => applyMarginSelection(event.target.value as PageSetup['margin'])}
              >
                {pageSetupOptions.margin.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
            {pageSetup.margin === 'custom' && (
              <div className="margin-grid">
                <span className="margin-grid__title">Margin (cm)</span>
                <div className="margin-grid__fields">
                  {marginSideFields.map(({ side, label }) => (
                    <label key={side}>
                      <span>{label}</span>
                      <input
                        key={`${side}-${pageSetup.marginValue ?? ''}`}
                        defaultValue={String(toCustomMargin(pageSetup.marginValue)[side])}
                        min={0}
                        onBlur={(event) => applyCustomMarginSide(side, event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            event.preventDefault()
                            applyCustomMarginSide(side, (event.target as HTMLInputElement).value)
                          }
                        }}
                        step={0.1}
                        type="number"
                      />
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      <input
        accept="application/json,.json"
        className="hidden-file-input"
        onChange={(event) => {
          void importJson(event.target.files?.[0] ?? null)
          event.currentTarget.value = ''
        }}
        ref={importInputRef}
        type="file"
      />
      {importError && <div className="json-error" role="alert">{importError}</div>}
    </header>
  )
}

export default TopNavBar
