import { useState } from 'react'
import { navItems, quickActions } from '../data/editorData'
import Icon from './Icon'

function TopNavBar() {
  const [activeTab, setActiveTab] = useState(navItems[0])

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
    </header>
  )
}

export default TopNavBar
