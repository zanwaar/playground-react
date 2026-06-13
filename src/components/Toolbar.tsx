import { formattingActions, toolbarLeft } from '../data/editorData'
import Icon from './Icon'

function Divider() {
  return <div className="divider" />
}

function DropdownLabel({ label }: { label: string }) {
  return (
    <button className="dropdown-label" type="button">
      <span>{label}</span>
      <Icon>arrow_drop_down</Icon>
    </button>
  )
}

function Toolbar() {
  return (
    <section className="toolbar" aria-label="Editor toolbar">
      {toolbarLeft.map((item) => (
        <button className="tool-button" key={item.icon} title={item.title} type="button">
          <Icon>{item.icon}</Icon>
        </button>
      ))}
      <Divider />
      <DropdownLabel label="Normal text" />
      <Divider />
      <DropdownLabel label="Arial" />
      <Divider />
      <div className="font-size-control">
        <button className="tool-button tool-button--compact" type="button"><Icon>remove</Icon></button>
        <input aria-label="Font size" defaultValue="11" />
        <button className="tool-button tool-button--compact" type="button"><Icon>add</Icon></button>
      </div>
      <Divider />
      {formattingActions.map((item, index) => (
        <span className="toolbar-group" key={item.icon}>
          {index === 4 && <Divider />}
          <button className="tool-button" title={item.title} type="button">
            <Icon className={item.highlighted ? 'icon-primary' : ''}>{item.icon}</Icon>
          </button>
        </span>
      ))}
      <div className="toolbar-spacer" />
      <button className="tool-button" type="button"><Icon>keyboard_arrow_up</Icon></button>
    </section>
  )
}

export default Toolbar
