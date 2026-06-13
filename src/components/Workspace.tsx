import { useEffect, useRef, useState } from 'react'
import type { MouseEvent } from 'react'
import { EditorContent } from '@tiptap/react'
import type { Editor } from '@tiptap/react'
import { bindWordPagePagination } from 'tiptap-extension-word-page'
import ContextToolbar from './ContextToolbar'

type WorkspaceProps = {
  editor: Editor | null
  onPageChange: (page: number) => void
}

function Workspace({ editor, onPageChange }: WorkspaceProps) {
  const workspaceRef = useRef<HTMLElement>(null)
  const [contextToolbar, setContextToolbar] = useState({ visible: false, x: 0, y: 0 })

  useEffect(() => {
    if (!editor) return undefined
    const workspace = workspaceRef.current
    if (!workspace) return undefined

    return bindWordPagePagination(editor, workspace)
  }, [editor])

  const handleScroll = () => {
    const workspace = workspaceRef.current
    if (!workspace) return

    const pages = Array.from(workspace.querySelectorAll<HTMLElement>('.a4-page'))
    const scrollPosition = workspace.scrollTop + workspace.offsetHeight / 2
    const currentPage = pages.reduce((pageNumber, page, index) => (
      scrollPosition >= page.offsetTop ? index + 1 : pageNumber
    ), 1)

    onPageChange(currentPage)
  }

  const handleSelection = (event: MouseEvent<HTMLElement>) => {
    const selection = window.getSelection()?.toString().trim()

    if (!selection) {
      setContextToolbar((toolbar) => ({ ...toolbar, visible: false }))
      return
    }

    setContextToolbar({ visible: true, x: event.clientX - 60, y: event.clientY - 45 })
  }

  const hideContextToolbar = (event: MouseEvent<HTMLElement>) => {
    if (!(event.target as HTMLElement).closest('.a4-page, .context-toolbar')) {
      setContextToolbar((toolbar) => ({ ...toolbar, visible: false }))
    }
  }

  return (
    <main className="workspace custom-scrollbar" onMouseDown={hideContextToolbar} onMouseUp={handleSelection} onScroll={handleScroll} ref={workspaceRef}>
      <EditorContent editor={editor} />
      <ContextToolbar editor={editor} position={{ x: contextToolbar.x, y: contextToolbar.y }} visible={contextToolbar.visible} />
    </main>
  )
}

export default Workspace
