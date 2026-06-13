import { useState } from 'react'
import { useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Page, PageBreak, createBlankWordPageDocument } from 'tiptap-extension-word-page'
import 'tiptap-extension-word-page/style.css'
import './App.css'
import StatusBar from './components/StatusBar'
import Toolbar from './components/Toolbar'
import TopNavBar from './components/TopNavBar'
import Workspace from './components/Workspace'
import { TextAlign } from './extensions/TextAlign'

function App() {
  const [currentPage, setCurrentPage] = useState(1)
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign,
      Page,
      PageBreak,
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
      <TopNavBar />
      <Toolbar editor={editor} />
      <Workspace editor={editor} onPageChange={setCurrentPage} />
      <StatusBar currentPage={currentPage} totalPages={editor?.state.doc.childCount ?? 3} />
    </div>
  )
}

export default App
