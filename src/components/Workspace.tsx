import { useEffect, useRef } from 'react'
import { EditorContent } from '@tiptap/react'
import type { Editor } from '@tiptap/react'
import { bindWordPagePagination } from '@zanwaar/tiptap-docs-kit'


type WorkspaceProps = {
  editor: Editor | null
  onPageChange: (page: number) => void
}

function Workspace({ editor, onPageChange }: WorkspaceProps) {
  const workspaceRef = useRef<HTMLElement>(null)

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

  return (
    <main className="workspace custom-scrollbar" onScroll={handleScroll} ref={workspaceRef}>
      <EditorContent editor={editor} />
    </main>
  )
}

export default Workspace
