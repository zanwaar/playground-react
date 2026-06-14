import { useState } from 'react'
import { useEditor } from '@tiptap/react'
import { DocsKit, createBlankWordPageDocument } from 'tiptap-docs-kit'
import 'tiptap-docs-kit/style.css'
import './App.css'
import StatusBar from './components/StatusBar'
import Toolbar from './components/Toolbar'
import TopNavBar from './components/TopNavBar'
import Workspace from './components/Workspace'

function App() {
  const [currentPage, setCurrentPage] = useState(1)
  const editor = useEditor({
    extensions: [
      DocsKit,
    ],
    content: createBlankWordPageDocument(),
    editorProps: {
      attributes: {
        class: 'word-editor-document',
      },
    },
  })

  return (
    <div className="editor-shell">
      <TopNavBar editor={editor} />
      <Toolbar editor={editor} />
      <Workspace editor={editor} onPageChange={setCurrentPage} />
      <StatusBar currentPage={currentPage} totalPages={editor?.state.doc.childCount ?? 3} />
    </div>
  )
}

export default App
