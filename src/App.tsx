import { useState } from 'react'
import './App.css'
import StatusBar from './components/StatusBar'
import Toolbar from './components/Toolbar'
import TopNavBar from './components/TopNavBar'
import Workspace from './components/Workspace'

function App() {
  const [currentPage, setCurrentPage] = useState(1)

  return (
    <div className="editor-shell">
      <TopNavBar />
      <Toolbar />
      <Workspace onPageChange={setCurrentPage} />
      <StatusBar currentPage={currentPage} />
    </div>
  )
}

export default App
