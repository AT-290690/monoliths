import { DOCUMENTATION } from '../chip/language/extensions/doc.js'
import {
  compress,
  decompress,
  encodeBase64,
} from '../chip/language/misc/compression.js'
import { removeNoCode } from '../chip/language/misc/helpers.js'
import { LZUTF8 } from '../chip/language/misc/lz-utf8.js'
import { compilePlain } from '../chip/language/misc/utils.js'
import {
  autoComplete,
  consoleEditor,
  consoleElement,
  droneButton,
  errorIcon,
  execIcon,
  keyIcon,
  xIcon,
} from '../main.js'
import { editor } from '../main.js'
import {
  run,
  printErrors,
  State,
  droneIntel,
  exe,
  API,
  matchDiff,
  checkDir,
  rmDir,
  openApp,
} from './utils.js'

export const execute = async (CONSOLE) => {
  consoleElement.classList.remove('error_line')
  consoleElement.classList.add('info_line')
  const selectedConsoleLine = CONSOLE.value.trim()
  const [CMD, ...PARAMS] = selectedConsoleLine.split(' ')
  switch (CMD?.trim()?.toUpperCase()) {
    case 'CLEAR':
      State.lastSelectedFile = null
      editor.setValue('')
      consoleElement.value = ''
      droneIntel(xIcon)
      break
    case 'EMPTY':
      fetch(`${API}empty?dir=${State.dir}`, {
        method: 'DELETE',
        'Content-Type': 'application/json',
        credentials: 'same-origin',
      }).then(() => {
        droneIntel(xIcon)
        editor.setValue('')
        consoleElement.value = ''
        consoleElement.setAttribute('placeholder', `>_`)
        State.lastSelectedFile = null
        State.cache = ''
        State.fileTree = { ['']: Object.create(null) }
      })
      break
    case 'SKETCH':
      {
        consoleElement.value = ''
        State.cache = ''
        const sub = PARAMS[0]
          ? PARAMS[0][PARAMS[0].length - 1] !== '/'
            ? PARAMS[0] + '/'
            : PARAMS[0]
          : ''
        const source = `<- ["SKETCH"; "COLOR"] [LIBRARY];
<- ["make_scene"; "set_stroke"; "no_fill"; "make_group"; "background"; "get_rotation";"width"; "height";
  "no_stroke"; "update"; "make_rectangle"; "set_fill"; "set_opacity"; "set_position"; "insert_into_group";
  "set_scale"; "set_rotation"; "set_screen_size"; "set_origin"; "make_group"; "UTILS"] [SKETCH];
<- ["make_rgb_color"] [COLOR];
<- ["make_grid"] [UTILS];

:= [make_shape; -> [x; y; .. [
  make_rectangle [x; y; 50; 50]
  ]]];
make_scene [300; 300; -> [.. [
make_shape [width [0.5]; height [0.5]];
set_screen_size [300; 300];
update []]]];
make_grid[]`
        const filename = sub + '0_sketch.bit'
        fetch(`${API}save?dir=${State.dir}&filename=${filename}`, {
          method: 'POST',
          'Content-Type': 'application/json',
          credentials: 'same-origin',
          body: JSON.stringify(matchDiff(State.cache, source)),
        }).then(() => {
          droneIntel(keyIcon)
          droneButton.classList.remove('shake')
          State.cache = source
          State.lastSelectedFile = filename
          checkDir(filename)
          editor.setValue(source)
          consoleElement.setAttribute('placeholder', `. ${filename}`)
        })
      }
      break
    case 'SKETCH_PACK':
      {
        consoleElement.value = ''
        State.cache = ''
        const sub = PARAMS[0]
          ? PARAMS[0][PARAMS[0].length - 1] !== '/'
            ? PARAMS[0] + '/'
            : PARAMS[0]
          : ''
        Promise.all([
          fetch(`${API}save?dir=${State.dir}&filename=${sub}0_imports.bit`, {
            method: 'POST',
            'Content-Type': 'application/json',
            credentials: 'same-origin',
            body: JSON.stringify(
              matchDiff(
                State.cache,
                `<- ["SKETCH"; "COLOR"] [LIBRARY];
<- ["make_scene"; "set_stroke"; "no_fill"; "make_group"; "background"; "get_rotation";"width"; "height";
    "no_stroke"; "update"; "make_rectangle"; "set_fill"; "set_opacity"; "set_position"; "insert_into_group";
    "set_scale"; "set_rotation"; "set_screen_size"; "set_origin"; "make_group"; "UTILS"] [SKETCH];
<- ["make_rgb_color"] [COLOR];
<- ["make_grid"] [UTILS];`
              )
            ),
          }),
          fetch(`${API}save?dir=${State.dir}&filename=${sub}1_shape.bit`, {
            method: 'POST',
            'Content-Type': 'application/json',
            credentials: 'same-origin',
            body: JSON.stringify(
              matchDiff(
                State.cache,
                `:= [make_shape; -> [x; y; .. [
  make_rectangle [x; y; 50; 50]
]]];`
              )
            ),
          }),
          fetch(`${API}save?dir=${State.dir}&filename=${sub}2_scene.bit`, {
            method: 'POST',
            'Content-Type': 'application/json',
            credentials: 'same-origin',
            body: JSON.stringify(
              matchDiff(
                State.cache,
                `make_scene [300; 300; -> [.. [
make_shape [width [0.5]; height [0.5]];
set_screen_size [300; 300];
update []]]];
make_grid[];
`
              )
            ),
          }),
        ]).then(() => {
          droneIntel(keyIcon)
          droneButton.classList.remove('shake')
        })
      }
      break
    case 'RUN':
    case '':
      run()
      break
    case 'LICENSE':
      editor.setValue(`
  MIT License

  Copyright (c) 2023 AT-290690
  
  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:
  
  The above copyright notice and this permission notice shall be included in all
  copies or substantial portions of the Software.
  
  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
  `)
      droneIntel(keyIcon)

      break
    case '_LOG':
      {
        consoleElement.value = ''
        consoleElement.classList.add('info_line')
        consoleElement.classList.remove('error_line')
        const source = editor.getValue()
        const selection = editor.getSelection().trim()
        if (!selection) return (consoleElement.value = 'Nothing is selected!')
        const out = `__debug_log[${
          selection[selection.length - 1] === ';'
            ? selection.substring(0, selection.length - 1)
            : selection
        }; ""]`
        editor.replaceSelection(out)

        exe(`:=[__debug_log; LOGGER[0]]; ${editor.getValue().trim()}`)
        editor.setValue(source)
        consoleEditor.focus()
      }

      break
    case 'SIGNAL':
    case '!64':
      {
        fetch(`${API}execute?dir=${State.dir}&type=js64`, {
          method: 'POST',
          'Content-Type': 'application/text',
          credentials: 'same-origin',
          body: LZUTF8.compress(compress(removeNoCode(editor.getValue())), {
            outputEncoding: 'Base64',
          }),
        })
          .then(() => droneIntel(execIcon))
          .catch((err) => console.log(err))
        consoleElement.value = ''
      }
      break
    case 'BEACON':
    case '!':
      {
        const sub = PARAMS[0]
          ? PARAMS[0][PARAMS[0].length - 1] !== '/'
            ? PARAMS[0] + '/'
            : PARAMS[0]
          : ''
        fetch(`${API}execute?dir=${State.dir}&sub=${sub}&type=js`, {
          method: 'POST',
          'Content-Type': 'application/json',
          credentials: 'same-origin',
        })
          .then(() => droneIntel(execIcon))
          .catch((err) => console.log(err))
        consoleElement.value = ''
      }
      break
    case 'ISIGNAL':
    case '>>64':
      {
        fetch(`${API}execute?dir=${State.dir}&type=bit64`, {
          method: 'POST',
          'Content-Type': 'application/text',
          credentials: 'same-origin',
          body: LZUTF8.compress(compress(removeNoCode(editor.getValue())), {
            outputEncoding: 'Base64',
          }),
        })
          .then(() => droneIntel(execIcon))
          .catch((err) => console.log(err))
        consoleElement.value = ''
      }
      break
    case 'IBEACON':
    case '>>':
      {
        fetch(
          `${API}execute?dir=${State.dir}&sub=${PARAMS[0] ?? ''}&type=bit`,
          {
            method: 'POST',
            'Content-Type': 'application/json',
            credentials: 'same-origin',
          }
        )
          .then(() => droneIntel(execIcon))
          .catch((err) => console.log(err))
        consoleElement.value = ''
      }
      break
    case 'JS':
      editor.setValue(compilePlain(editor.getValue()))
      break
    case 'COMPILE':
    case '$':
      {
        const sub = PARAMS[0]
          ? PARAMS[0][PARAMS[0].length - 1] !== '/'
            ? PARAMS[0] + '/'
            : PARAMS[0]
          : ''
        fetch(
          `${API}execute?dir=${State.dir}&sub=${sub}&target=${
            PARAMS[1] ?? 'index.html'
          }&type=compile`,
          {
            method: 'POST',
            'Content-Type': 'application/json',
            credentials: 'same-origin',
          }
        )
          .then(() => droneIntel(execIcon))
          .catch((err) => console.log(err))
        consoleElement.value = ''
      }
      break
    case 'DIR':
      fetch(API + 'dir', { credentials: 'same-origin' })
        .then((res) => res.text())
        .then((data) => {
          consoleElement.value = ''
          State.dir = data
          State.fileTree = {
            ['']: { size: 0, filename: 'root', type: 'dir' },
          }
          consoleElement.setAttribute('placeholder', `>_`)
          State.lastSelectedFile = null
          State.cache = ''
        })
      break
    case 'LIST':
    case '..':
      {
        const sub = PARAMS[0] ?? ''
        const response = await fetch(`${API}ls?dir=${State.dir}&sub=${sub}`, {
          credentials: 'same-origin',
        })
        if (response.status !== 200) {
          droneIntel(errorIcon)
          consoleElement.classList.remove('info_line')
          consoleElement.classList.add('error_line')
          consoleElement.value = `${response.status}: ${
            response.statusText ?? 'Unauthorized'
          }`
          droneButton.classList.remove('shake')
          droneButton.classList.add('shake')
          break
        }
        const files = await response.json()
        const { cd } = checkDir(sub)
        autoComplete.innerHTML = ''
        files.forEach((file) => {
          cd[file.filename] = file
        })
        consoleElement.dispatchEvent(new KeyboardEvent('input'))
      }
      break
    case 'ESC':
    case 'X':
      document.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Escape',
        })
      )
      break
    case 'LOAD':
    case '.':
      {
        const filename = PARAMS[0] ?? State.lastSelectedFile ?? 'entry.bit'
        const response = await fetch(`${API}portals/${State.dir}/${filename}`, {
          credentials: 'same-origin',
        })
        const data = await response.text()
        if (response.status !== 200) {
          droneIntel(errorIcon)
          consoleElement.classList.remove('info_line')
          consoleElement.classList.add('error_line')
          consoleElement.value = data
          droneButton.classList.remove('shake')
          droneButton.classList.add('shake')
          break
        }
        State.cache = data
        editor.setValue(data)
        State.lastSelectedFile = filename
        droneIntel(keyIcon)
        consoleElement.value = ''
        consoleElement.setAttribute('placeholder', `. ${filename}`)
      }
      break
    case 'DUMP':
    case '*':
      {
        consoleElement.value = ''
        const newFile = PARAMS[0]
        const filename = newFile ?? State.lastSelectedFile ?? 'entry.bit'
        const source = consoleEditor
          .getValue()
          .split('\n')
          .filter((x) => !(x[0] === '/' && x[1] === '/'))
          .join('\n')
        if (newFile !== State.lastSelectedFile) State.cache = ''
        fetch(`${API}save?dir=${State.dir}&filename=${filename}`, {
          method: 'POST',
          'Content-Type': 'application/json',
          credentials: 'same-origin',
          body: JSON.stringify(matchDiff(State.cache, source)),
        }).then(() => {
          droneIntel(keyIcon)
          droneButton.classList.remove('shake')
          State.cache = source
          State.lastSelectedFile = filename
        })
      }

      break
    case 'MANGLE':
      editor.setValue(compress(removeNoCode(editor.getValue())))
      consoleElement.value = ''
      break
    case 'DEMANGLE':
      editor.setValue(decompress(editor.getValue()))
      consoleElement.value = ''
      break
    case 'URI':
      editor.setValue(encodeURIComponent(encodeBase64(editor.getValue())))
      consoleElement.value = ''
      break
    case 'IRU':
      editor.setValue(
        decompress(
          LZUTF8.decompress(decodeURIComponent(editor.getValue().trim()), {
            inputEncoding: 'Base64',
            outputEncoding: 'String',
          })
        )
      )
      consoleElement.value = ''
      break
    case 'COMPRESS':
      editor.setValue(
        LZUTF8.compress(compress(removeNoCode(editor.getValue())), {
          outputEncoding: 'Base64',
        })
      )
      consoleElement.value = ''
      break
    case 'DECOMPRESS':
      editor.setValue(
        decompress(
          LZUTF8.decompress(decodeURIComponent(editor.getValue().trim()), {
            inputEncoding: 'Base64',
            outputEncoding: 'String',
          })
        )
      )
      consoleElement.value = ''
      break
    case 'RENAME':
    case '~':
      consoleElement.value = ''
      const rename = PARAMS[0]
      if (rename && State.lastSelectedFile) {
        fetch(
          `${API}rename?dir=${State.dir}&filename=${State.lastSelectedFile}&rename=${rename}`,
          {
            method: 'PUT',
            'Content-Type': 'application/json',
            credentials: 'same-origin',
          }
        ).then(() => {
          droneIntel(keyIcon)
          droneButton.classList.remove('shake')
          State.lastSelectedFile = rename
          checkDir(rename)
          consoleElement.setAttribute('placeholder', `. ${rename}`)
        })
      }
      State.lastSelectedFile
      break

    case 'SAVE':
    case '+':
      {
        consoleElement.value = ''
        const newFile = PARAMS[0]
        const filename = newFile ?? State.lastSelectedFile ?? 'entry.bit'
        const source = editor.getValue()
        if (newFile !== State.lastSelectedFile) State.cache = ''
        fetch(`${API}save?dir=${State.dir}&filename=${filename}`, {
          method: 'POST',
          'Content-Type': 'application/json',
          credentials: 'same-origin',
          body: JSON.stringify(matchDiff(State.cache, source)),
        }).then(() => {
          droneIntel(keyIcon)
          droneButton.classList.remove('shake')
          State.cache = source
          State.lastSelectedFile = filename
          checkDir(filename)
          // const { structure } = changeDir(filename)
          // structure.pop()
          // State.currentDir = structure
          consoleElement.setAttribute('placeholder', `. ${filename}`)
        })
      }
      break
    case '++':
      State.lastSelectedFile = null
      editor.setValue('')
      consoleElement.value = ''
      execute({ value: '+ ' + PARAMS[0] ?? '' })
      break

    case 'ENCODE':
    case '%':
      {
        const encoded = encodeURIComponent(encodeBase64(editor.getValue()))
        const link = `https://at-290690.github.io/monoliths/public/chip/preview.html?s=`
        if (encoded) window.open(link + encoded, '_blank').focus()
      }
      break
    case 'WINDOW':
    case '#':
      openApp(
        `${API}portals/${State.dir}/${PARAMS[0] ?? 'index.html'}`
      ).style.background = PARAMS[1] ?? 'transparent'
      break
    case 'SHARE':
    case '@':
      consoleElement.value = `${API}portals/${State.dir}/${
        PARAMS[0] ?? State.lastSelectedFile ?? 'index.html'
      }`
      break
    case 'DELETE':
    case '-':
      {
        const filename = PARAMS[0] ?? State.lastSelectedFile
        fetch(`${API}del?dir=${State.dir}&filename=${filename}`, {
          method: 'DELETE',
          'Content-Type': 'application/json',
          credentials: 'same-origin',
        })
          .then(() => {
            droneIntel(xIcon)
          })
          .finally(() => {
            editor.setValue('')
            consoleElement.value = ''
            consoleElement.setAttribute('placeholder', `>_`)
            State.lastSelectedFile = null
            State.cache = ''
            rmDir(filename)
          })
      }
      break
    case 'DOC':
      {
        const name = PARAMS[0]
        const sub = PARAMS[1]

        editor.setValue(
          !name
            ? Object.values(DOCUMENTATION)
                .map((x) => Object.entries(x).join('\n'))
                .join('\n')
            : sub
            ? DOCUMENTATION[name][sub]
            : Object.entries(DOCUMENTATION[name]).join('\n')
        )
      }
      break
    case 'HELP':
    case '?':
      State.cache = ''
      editor.setValue(`
-----------------------------
 Press on the drone - run code
 Press ctrl/command + s - run code
-----------------------------
 Enter a command in the console
 ---------[COMMANDS]---------
 HELP: list these commands
 DOC: list documentation for modules
 RUN: run code 
 CLEAR: clears the editor content
 X: clears search, log and canvas pannels
 EMPTY: deletes all files in the folder
 WINDOW: open app window
 COMPILE: compiles the selected dir
 SAVE: save in starage
 LOAD: load from storage
 DELETE: remove from storage
 LIST: list folder content content
 SHARE: create a share link of a file
 DUMP: dump console output in a file
 LICENSE: read license info
 ----------------------------
`)
      droneIntel(keyIcon)
      consoleElement.value = ''
      break
    default:
      if (CMD.trim()) printErrors(CMD + ' does not exist!')
      else consoleElement.value = ''
      droneIntel(errorIcon)
      break
  }
}
