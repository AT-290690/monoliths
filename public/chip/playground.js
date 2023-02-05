import { CodeMirror } from './editor/cell.editor.bundle.js'
import { run as chipRun } from './language/misc/utils.js'
import { encodeBase64 } from './language/misc/compression.js'

const consoleElement = document.getElementById('console')
const editorContainer = document.getElementById('editor-container')
const droneButton = document.getElementById('drone')
const errorIcon = document.getElementById('error-drone-icon')
const execIcon = document.getElementById('exec-drone-icon')
const popupContainer = document.getElementById('popup-container')
const autoComplete = document.getElementById('autocomplete-container')
const applicationContainer = document.getElementById('application-container')
const consoleEditor = CodeMirror(popupContainer)

const State = {
  activeWindow: null,
  dir: '',
  input: '',
}

const extensions = {
  LOGGER: (disable = 0) => {
    if (disable) return () => {}
    popupContainer.style.display = 'block'
    const popup = consoleEditor
    popup.setValue('')
    const bouds = document.body.getBoundingClientRect()
    const width = bouds.width
    const height = bouds.height
    popup.setSize(width - 2, height / 3)
    return (msg) => {
      const current = popup.getValue()
      popup.setValue(
        `${current ? current : ''}
${
  msg !== undefined
    ? typeof msg === 'string'
      ? `"${msg}"`
      : typeof msg === 'function'
      ? '-> []'
      : JSON.stringify(
          msg.constructor.name === 'Brrr'
            ? msg.items
            : msg.constructor.name === 'Map'
            ? Object.fromEntries(msg)
            : msg,
          null
        )
          .replaceAll('[', '.: [')
          .replaceAll('{', ':: [')
          .replaceAll('}', ']')
          .replaceAll(',', '; ')
          .replaceAll('":', '"; ')
          .replaceAll('null', 'void')
          .replaceAll('undefined', 'void')
    : 'void'
}`
      )
      popup.setCursor(
        popup.posToOffset({ ch: 0, line: popup.lineCount() - 1 }),
        true
      )
      return msg
    }
  },
}

const droneIntel = (icon) => {
  icon.style.visibility = 'visible'
  setTimeout(() => (icon.style.visibility = 'hidden'), 500)
}
const exe = async (source) => {
  try {
    const result = chipRun(source, extensions)
    droneButton.classList.remove('shake')
    droneIntel(execIcon)
    return result
  } catch (err) {
    consoleElement.classList.remove('info_line')
    consoleElement.classList.add('error_line')
    consoleElement.value = consoleElement.value.trim() || err + ' '
    droneButton.classList.remove('shake')
    droneButton.classList.add('shake')
    // editor.focus()
    // console.log(err)
    droneIntel(errorIcon)
  }
}

const editor = CodeMirror(editorContainer, {})
droneButton.addEventListener('click', () => {
  consoleElement.value = ''
  consoleElement.classList.add('info_line')
  consoleElement.classList.remove('error_line')
  const source = editor.getValue()
  const selection = editor.getSelection().trim()
  if (!selection) {
    return document.dispatchEvent(
      new KeyboardEvent('keydown', {
        ctrlKey: true,
        key: 's',
      })
    )
  }
  const out = `__debug_log[${
    selection[selection.length - 1] === ';'
      ? selection.substring(0, selection.length - 1)
      : selection
  }; ""]`
  editor.replaceSelection(out)

  exe(`:=[__debug_log; LOGGER[0]]; ${editor.getValue().trim()}`)
  editor.setValue(source)
  consoleEditor.focus()
})
editorContainer.addEventListener(
  'click',
  () => (State.activeWindow = editorContainer)
)

document.addEventListener('keydown', (e) => {
  if (e.key && e.key.toLowerCase() === 's' && (e.ctrlKey || e.metaKey)) {
    e = e || window.event
    e.preventDefault()
    e.stopPropagation()
    popupContainer.style.display = 'none'
    consoleElement.value = ''
    exe(editor.getValue().trim())
    const encoded = encodeURIComponent(encodeBase64(editor.getValue()))
    popupContainer.style.display = 'block'
    const bouds = document.body.getBoundingClientRect()
    const width = bouds.width
    const height = bouds.height
    consoleEditor.setSize(width - 2, height / 3)
    consoleEditor.setValue(encoded)
    if (encoded)
      window.open(
        `https://at-290690.github.io/monoliths/public/chip/preview.html?s=` +
          encoded,
        'Bit',
        `menubar=no,directories=no,toolbar=no,status=no,scrollbars=no,resize=no,width=600,height=600,left=600,top=150`
      )
  } else if (e.key === 'Escape') {
    e.preventDefault()
    e.stopPropagation()
    popupContainer.style.display = 'none'
    applicationContainer.style.display = 'none'
    autoComplete.innerHTML = ''
    autoComplete.style.display = 'none'
  }
})
State.activeWindow = editorContainer
editor.focus()
window.addEventListener('resize', () => {
  const bouds = document.body.getBoundingClientRect()
  const width = bouds.width
  const height = bouds.height
  editor.setSize(width - 10, height - 60)
  if (popupContainer.style.display === 'block') {
    consoleEditor.setSize(width - 2, height / 3)
  }
  if (applicationContainer.style.display === 'block') {
    applicationContainer.style.display = 'none'
  }
})
const bounds = document.body.getBoundingClientRect()
editor.setSize(bounds.width - 10, bounds.height - 60)
