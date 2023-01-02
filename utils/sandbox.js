import {
  compileExecutable,
  compileHtmlModule,
  compileModule,
  run,
} from '../public/chip/language/misc/utils.js'
import { writeFile, readFile } from 'fs/promises'
import {
  writeFile as writeFileCallback,
  readFile as readFileCallback,
} from 'fs'

import path from 'path'
import { runInNewContext } from 'vm'
const sanitizePath = (path) => path.replaceAll('../', '')
process.on('message', async ({ portal, files, dir, type, target }) => {
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
  try {
    switch (type) {
      case 'compile':
        {
          writeFile(`${portal}/${target}`, compileHtmlModule(script))
        }
        break
      case 'bit':
        {
          runInNewContext('run()', {
            run: () =>
              run(script, {
                read: (path, callback) =>
                  readFileCallback(
                    dir + sanitizePath(path),
                    'utf-8',
                    (err, data) => err ?? callback(data)
                  ),
                write: (path, data, callback) =>
                  writeFileCallback(
                    dir + sanitizePath(path),
                    data,
                    (err, data) => err ?? callback(data)
                  ),
              }),
          })
        }
        break
      case 'js':
        {
          runInNewContext(compileExecutable(script), {
            read: (path, callback) =>
              readFileCallback(
                dir + sanitizePath(path),
                'utf-8',
                (err, data) => err ?? callback(data)
              ),
            write: (path, data, callback) =>
              writeFileCallback(
                dir + sanitizePath(path),
                data,
                (err, data) => err ?? callback(data)
              ),
          })
        }
        break
    }
  } catch (err) {
    writeFile(dir + sanitizePath('errors.txt'), err.message)
  }
})
