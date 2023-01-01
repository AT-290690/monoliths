import {
  compileBuild,
  compileHtmlModule,
  compileModule,
} from '../public/chip/language/misc/utils.js'
import {
  compress,
  decompress,
} from '../public/chip/language/misc/compression.js'
import { removeNoCode } from '../public/chip/language/misc/helpers.js'
import { LZUTF8 } from '../public/chip/language/misc/lz-utf8.js'
import vm from 'vm'
import { readFile, writeFile, rm, mkdir } from 'fs/promises'
import Brrr from '../public/chip/language/extensions/Brrr.js'
const sanitizePath = (path) => path.replaceAll('../', '')

process.on('message', async ({ script, dir }) => {
  const sandbox = {
    Brrr: Brrr,
    read: (path) => readFile(dir + sanitizePath(path), 'utf-8'),
    write: (path, data) => writeFile(dir + sanitizePath(path), data),
    remove: (path) => rm(dir + sanitizePath(path), { recursive: true }),
    clear: () => rm(dir, { recursive: true }).then(() => mkdir(dir)),
    html: (data) => compileHtmlModule(data),
    module: (data) => compileModule(data),
    build: (data) => writeFile(dir + '/index.html', compileHtmlModule(data)),
    compress: (data) =>
      LZUTF8.compress(compress(removeNoCode(data)), {
        outputEncoding: 'Base64',
      }),
    decompress: (data) =>
      decompress(
        LZUTF8.decompress(decodeURIComponent(data.trim()), {
          inputEncoding: 'Base64',
          outputEncoding: 'String',
        })
      ),
  }
  try {
    const parsed = compileBuild(script)
    vm.runInNewContext(parsed.replaceAll('await', 'await '), sandbox)
    sandbox.entry()
  } catch (err) {
    console.log(err)
  }
})
