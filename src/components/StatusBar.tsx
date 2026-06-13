import Icon from './Icon'

type StatusBarProps = {
  currentPage: number
}

function StatusBar({ currentPage }: StatusBarProps) {
  return (
    <footer className="status-bar">
      <div className="status-group">
        <button type="button">Page {currentPage} of 3</button>
        <button type="button">Word Count: 184 words</button>
      </div>
      <div className="status-group status-group--right">
        <button type="button"><Icon>spellcheck</Icon> Spelling: English</button>
        <button type="button"><Icon>accessibility</Icon> Accessibility</button>
        <button className="editing-mode" type="button"><Icon>edit</Icon> Editing <Icon>arrow_drop_down</Icon></button>
      </div>
    </footer>
  )
}

export default StatusBar
