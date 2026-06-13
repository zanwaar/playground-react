import { useRef, useState } from 'react'
import type { MouseEvent } from 'react'
import ContextToolbar from './ContextToolbar'
import { ContentsPage, CoverPage, PrefacePage } from './Pages'

type WorkspaceProps = {
  onPageChange: (page: number) => void
}

function Workspace({ onPageChange }: WorkspaceProps) {
  const workspaceRef = useRef<HTMLElement>(null)
  const [contextToolbar, setContextToolbar] = useState({ visible: false, x: 0, y: 0 })

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
    <main className="workspace custom-scrollbar" onMouseDown={hideContextToolbar} onScroll={handleScroll} ref={workspaceRef}>
      <CoverPage onSelection={handleSelection} />
      <PrefacePage onSelection={handleSelection} />
      <ContentsPage onSelection={handleSelection} />
      <ContextToolbar position={{ x: contextToolbar.x, y: contextToolbar.y }} visible={contextToolbar.visible} />
    </main>
  )
}

export default Workspace
