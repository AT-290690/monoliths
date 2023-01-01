import { compileHtmlModule } from '../public/chip/language/misc/utils.js'
import { writeFile, readFile } from 'fs/promises'
import path from 'path'
const sanitizePath = (path) => path.replaceAll('../', '')
process.on('message', async ({ files, dir }) => {
  try {
    const script = (
      await Promise.all(
        files
          .filter((f) => path.extname(f).slice(1) === 'bit')
          .sort((a, b) =>
            parseInt(a.match(/^\d+/)) > parseInt(b.match(/^\d+/)) ? 1 : -1
          )
          .map((file) => readFile(dir + sanitizePath(file), 'utf-8'))
      )
    ).join('\n')
    writeFile(dir + '/index.html', compileHtmlModule(script))
  } catch (err) {
    console.log(err)
  }
})
