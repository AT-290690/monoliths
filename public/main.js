import { CodeMirror } from './chip/editor/cell.editor.bundle.js'
import { execute } from './commands/exec.js'
import { API, checkDir, run, State } from './commands/utils.js'
export const consoleElement = document.getElementById('console')
export const editorContainer = document.getElementById('editor-container')
export const mainContainer = document.getElementById('main-container')
export const headerContainer = document.getElementById('header')
// export const keyButton = document.getElementById('key')
// export const appButton = document.getElementById('app-settings')
// export const formatterButton = document.getElementById('formatter')
export const droneButton = document.getElementById('drone')
export const errorIcon = document.getElementById('error-drone-icon')
export const execIcon = document.getElementById('exec-drone-icon')
export const formatterIcon = document.getElementById('formatter-drone-icon')
export const keyIcon = document.getElementById('key-drone-icon')
export const xIcon = document.getElementById('x-drone-icon')
export const popupContainer = document.getElementById('popup-container')
export const autoComplete = document.getElementById('autocomplete-container')
export const applicationContainer = document.getElementById(
  'application-container'
)
export const compositionContainer = document.getElementById(
  'composition-container'
)
export const editorResizerElement = document.getElementById('editor-resizer')
export const consoleResizerElement = document.getElementById('console-resizer')
export const consoleEditor = CodeMirror(popupContainer)

droneButton.addEventListener('click', () => execute({ value: '_LOG' }))
export const editor = CodeMirror(editorContainer, {})
editorContainer.addEventListener(
  'click',
  () => (State.activeWindow = editorContainer)
)

document.addEventListener('keydown', (e) => {
  const activeElement = document.activeElement
  if (e.key && e.key.toLowerCase() === 's' && (e.ctrlKey || e.metaKey)) {
    e = e || window.event
    e.preventDefault()
    e.stopPropagation()
    popupContainer.style.display = 'none'
    consoleElement.value = ''
    execute({ value: 'SAVE' })
  } else if (e.key === 'Enter' && activeElement === consoleElement) {
    execute(consoleElement)
  } else if (e.key === 'ArrowUp' && activeElement === consoleElement) {
    consoleElement.value = State.lastSelectedFile ?? 'entry.bit'
  } else if (e.key === 'Escape') {
    e.preventDefault()
    e.stopPropagation()
    popupContainer.style.display = 'none'
    applicationContainer.style.display = 'none'
    autoComplete.innerHTML = ''
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
window.addEventListener(
  'beforeunload',
  (e) =>
    (e.returnValue = `Before leaving make sure you save your work (if it's worth)`)
)

consoleElement.addEventListener('input', (e) => {
  const current = e.currentTarget.value
  if (current[0] === '.' && current[1] === '.') {
    autoComplete.style.display = 'none'
    autoComplete.innerHTML = ''
    if (
      current[current.length - 1] === '/' ||
      current[current.length - 1] === ' '
    ) {
      const {
        cd: { size, filename, dir, ...cd },
        structure,
      } = checkDir(current.split('.. ')[1])
      const fragment = document.createDocumentFragment()
      delete cd['']
      // delete cd['size']
      // delete cd['filename']
      // delete cd['dir']
      if (Object.keys(cd).length) {
        for (const f in cd) {
          const option = document.createElement('button')
          const file = cd[f]
          option.textContent = `${file.dir ? '.. ' : '. '} ${file.filename}`
          option.title = `size: ${(file.size / 1024).toFixed(1)} kb`
          option.addEventListener('click', () => {
            if (file.dir) consoleElement.value = `.. ${structure.join('/')}${f}`
            else consoleElement.value = `. ${structure.join('/')}${f}`
            option.parentNode.removeChild(option)
            autoComplete.style.display = 'none'
            autoComplete.innerHTML = ''
            consoleElement.focus()
          })
          option.classList.add('fs-autocomplete-option')
          fragment.appendChild(option)
        }
        autoComplete.style.display = 'grid'
        autoComplete.appendChild(fragment)
      }
    }
  }
})
const unloadSupportHandler = () => {
  if (unloadSupportHandler._hasUnloaded) return
  unloadSupportHandler._hasUnloaded = true
  navigator.sendBeacon(`${API}disconnect?dir=${State.dir}`)
}
window.addEventListener('pagehide', unloadSupportHandler)
window.addEventListener('unload', unloadSupportHandler)
const bounds = document.body.getBoundingClientRect()
editor.setSize(bounds.width - 10, bounds.height - 60)
consoleElement.setAttribute('placeholder', '>_')
execute({ value: 'DIR' })

/*

export const HyperLightEditor = (
  parent,
  { elements, onResize, onPopupResize, initialValue, showPopUpOnLoad }
) => {
  const editor = CodeMirror(parent)
  onResize(editor)
  if (initialValue !== undefined) editor.setValue(initialValue)
  const logErrorMessage = (msg) => {
    elements.popupContainer.style.display = 'none'
    elements.canvasContainer.style.display = 'none'
    elements.consoleElement.textContent = msg
  }
  // const urlSearchParams = new URLSearchParams(window.location.search)
  // const intilal = urlSearchParams.get('r')
  // const [, ...encoding] = location.href.split('?r=')
  // const intilal = encoding.join('').trim()

  const popUp = (
    popup,
    msg,
    w = document.body.getBoundingClientRect().width / 2 - 5,
    h = document.body.getBoundingClientRect().height / 3
  ) => {
    popup.setSize(w, h)
    popup.setValue(msg)
  }
  const popup = CodeMirror(elements.popupContainer)
  if (showPopUpOnLoad) {
    elements.popupContainer.style.display = 'block'
    onPopupResize(popup)
  }
  STD.IMP = (module) => {
    popUp(
      popup,
      `<- [${Object.keys(module)
        .filter((x) => x !== 'NAME')
        .map((x) => `"${x}"`)
        .join(';')}] [${module.NAME}];\n`,
      window.innerWidth * 1 - 20
    )
    popup.focus()
  }
  STD.COMPACT = (str) => removeNoCode(str)
  STD.COMPRESS = (str) => compress(str)
  STD.TOBASE64 = (str) => LZUTF8.compress(str, { outputEncoding: 'Base64' })
  STD.FROMBINARYSTRING = (str) =>
    LZUTF8.decompress(str, {
      inputEncoding: 'StorageBinaryString',
      outputEncoding: 'String',
    })
  STD.FROMBASE64 = (str) =>
    LZUTF8.decompress(str, {
      inputEncoding: 'Base64',
      outputEncoding: 'String',
    })
  STD.TOBINARYSTRING = (str) =>
    LZUTF8.compress(str, { outputEncoding: 'StorageBinaryString' })
  STD.LOGGER = (disable = 0, showCount = 1) => {
    if (disable) return (msg, count) => {}
    popup.setValue('')
    elements.popupContainer.style.display = 'block'
    onPopupResize(popup)
    // if (!!editor.getLine(editor.lineCount() - 1).trim()) {
    //   editor.addValue('\n'.repeat(window.innerHeight / 50))
    //   editor.setCursor(
    //     editor.posToOffset({ line: editor.lineCount() - 1, ch: 0 }),
    //     true
    //   )
    // }

    let count = 0
    return (msg, comment = '', space) => {
      let top = ''
      if (showCount) {
        const current = popup.getValue()
        top = `${current ? current + '\n' : ''};; ${count++} ${comment}\n`
      }
      popup.setValue(
        `${top}${
          msg !== VOID
            ? typeof msg === 'string'
              ? `"${msg}"`
              : typeof msg === 'function'
              ? '-> []'
              : JSON.stringify(
                  msg.constructor.name === 'Brrr' ? msg.items : msg,
                  null,
                  space
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
  }

  const updateApp = () => {
    const appDocument = elements.app.contentWindow.document
    appDocument.write(compile(editor.getValue(), '', logErrorMessage))
  }
  const openAppWindow = (e) => {
    elements.openAppButton.style.display = 'none'
    elements.openEditorButton.style.display = 'block'
    elements.consoleElement.textContent = ''
    elements.app.style.display = 'block'
    elements.canvasContainer.style.display = 'block'
    updateApp()
  }
  const openEditor = (e) => {
    elements.openEditorButton.style.display = 'none'
    elements.openAppButton.style.display = 'block'
    elements.app.style.display = 'none'
    elements.canvasContainer.style.display = 'none'
    elements.app.src = ''
    elements.consoleElement.textContent = ''
  }
  elements.openEditorButton.addEventListener('click', openEditor)
  elements.openAppButton.addEventListener('click', openAppWindow)
  elements.key.addEventListener('click', () => {
    const encoded = encodeURIComponent(encodeBase64(editor.getValue()))
    const link = 'https://at-290690.github.io/chip/preview.html?s='
    if (encoded) window.open(link + encoded, '_blank').focus()
  })
  window.addEventListener('resize', () => {
    onResize(editor)
    if (elements.popupContainer.style.display === 'block') onPopupResize(popup)
  })
  const runCodeEvent = () => {
    if (elements.app.style.display === 'block') {
      elements.app.src = ''
      setTimeout(updateApp, 250)
    } else {
      elements.canvasContainer.style.display = 'none'
      return interpred(editor.getValue(), logErrorMessage)
    }
  }
  document.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase()
    if (key === 's' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      e.stopPropagation()
      elements.consoleElement.textContent = ''
      runCodeEvent()
    } else if (key === 'escape') {
      e.preventDefault()
      e.stopPropagation()
      elements.popupContainer.style.display = 'none'
      openEditor()
    }
  })
  elements.run.addEventListener('click', () =>
    STD.LOGGER(0, 0)(interpred(editor.getValue().trim(), logErrorMessage))
  )
  return editor
}

*/
