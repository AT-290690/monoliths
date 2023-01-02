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
import { decompress } from '../public/chip/language/misc/compression.js'
import { LZUTF8 } from '../public/chip/language/misc/lz-utf8.js'
const sanitizePath = (path) => path.replaceAll('../', '')
process.on('message', async ({ portal, files, dir, type, target, payload }) => {
  try {
    switch (type) {
      case 'compile':
        {
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
          writeFile(`${portal}/${target}`, compileHtmlModule(script))
        }
        break
      case 'bit64':
        runInNewContext('run()', {
          run: () =>
            run(
              decompress(
                LZUTF8.decompress(decodeURIComponent(payload.trim()), {
                  inputEncoding: 'Base64',
                  outputEncoding: 'String',
                })
              ),
              {
                stringify: (data) => JSON.stringify(data),
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
              }
            ),
        })
        break
      case 'bit':
        {
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
          runInNewContext('run()', {
            run: () =>
              run(script, {
                stringify: (data) => JSON.stringify(data),
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
      case 'js64':
        {
          runInNewContext(
            compileExecutable(
              decompress(
                LZUTF8.decompress(decodeURIComponent(payload.trim()), {
                  inputEncoding: 'Base64',
                  outputEncoding: 'String',
                })
              )
            ),
            {
              stringify: (data) => JSON.stringify(data),
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
            }
          )
        }
        break
      case 'js':
        {
          runInNewContext(compileExecutable(script), {
            stringify: (data) => JSON.stringify(data),
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
