import { removeNoCode, wrapInBody } from './helpers.js'
import { parse } from '../core/parser.js'
import { LZUTF8 } from './lz-utf8.js'
import { STD } from '../extensions/extentions.js'

export const ABC = [
  'a',
  'b',
  'c',
  'd',
  'e',
  'f',
  'g',
  'h',
  'i',
  'j',
  'k',
  'l',
  'm',
  'n',
  'o',
  'p',
  'q',
  'r',
  's',
  't',
  'u',
  'v',
  'w',
  'x',
  'y',
  'z',
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
]

export const generateCompressedModules = () => {
  const { NAME, ...lib } = STD.LIBRARY
  const modules = new Set([NAME])
  const dfs = (lib, modules) => {
    for (const module in lib) {
      if (module.length > 2) modules.add(module)
      for (const m in lib[module]) {
        if (lib[module][m].NAME) dfs(lib[module][m], modules)
        if (m !== 'NAME' && m.length > 2) modules.add(m)
      }
    }
  }
  dfs(lib, modules)
  let index = 0
  let count = 0
  return [...modules]
    .sort((a, b) => (a.length > b.length ? 1 : -1))
    .map((full) => {
      const short = count + ABC[index]
      ++index
      if (index === ABC.length) {
        index = 0
        ++count
      }
      return { full, short }
    })
}

export const shortModules = generateCompressedModules()
const dfs = (
  tree,
  definitions = new Set(),
  imports = new Set()
  // excludes = new Set()
) => {
  for (const node of tree) {
    const { type, operator, args, value } = node
    if (type === 'import' && node.class === 'string') imports.add(value)
    // if (type === 'value' && node.class === 'string') excludes.add(value)
    else if (
      type === 'word' &&
      node.name.length > 1 &&
      node.name[0] !== '_' &&
      !imports.has(node.name)
    )
      definitions.add(node.name)
    else if (type === 'apply' && operator.type === 'word')
      args.forEach(({ name }) => {
        if (name && name.length > 2 && name[0] !== '_') {
          definitions.add(name)
        }
      })
    if (Array.isArray(args)) dfs(args, definitions, imports)
    if (Array.isArray(operator?.args)) dfs(operator.args, definitions, imports)
  }
  return { definitions, imports }
}
export const compress = (source) => {
  const value = removeNoCode(source)
  const AST = parse(wrapInBody(value))
  const { definitions, imports } = dfs(
    AST.args,
    new Set(),
    new Set(['LIBRARY'])
  )

  // imports.forEach(value => {
  //   if (definitions.has(value)) definitions.delete(value)
  // })

  const importedModules = shortModules.reduce((acc, item) => {
    if (imports.has(item.full)) acc.push(item)
    return acc
  }, [])

  const defs = [...definitions]
  let { result, occurance } = value
    .split('];]')
    .join(']]')
    .split('')
    .reduce(
      (acc, item) => {
        if (item === ']') acc.occurance++
        else {
          if (acc.occurance < 3) {
            acc.result += ']'.repeat(acc.occurance)
            acc.occurance = 0
          } else {
            acc.result += "'" + acc.occurance
            acc.occurance = 0
          }
          acc.result += item
        }
        return acc
      },
      { result: '', occurance: 0 }
    )
  if (occurance > 0) result += "'" + occurance

  for (const { full, short } of importedModules)
    result = result.replaceAll(new RegExp(`\\b${full}\\b`, 'g'), short)

  let index = 0
  let count = 0
  const shortDefinitions = defs
    .sort((a, b) => (a.length > b.length ? 1 : -1))
    .map((full) => {
      const short = ABC[index] + count
      ++index
      if (index === ABC.length) {
        index = 0
        ++count
      }
      return { full, short }
    })
  for (const { full, short } of shortDefinitions)
    result = result.replaceAll(new RegExp(`\\b${full}\\b`, 'g'), short)
  return result
}
export const decompress = (source) => {
  const suffix = [...new Set(source.match(/\'+?\d+/g))]
  let result = suffix.reduce(
    (acc, m) => acc.split(m).join(']'.repeat(parseInt(m.substring(1)))),
    source
  )
  for (const { full, short } of shortModules)
    result = result.replaceAll(new RegExp(`\\b${short}\\b`, 'g'), full)
  return result
}
export const encodeBase64 = (source) =>
  LZUTF8.compress(compress(source).trim(), { outputEncoding: 'Base64' })

export const decodeBase64 = (source) =>
  decompress(
    LZUTF8.decompress(source.trim(), {
      inputEncoding: 'Base64',
      outputEncoding: 'String',
    })
  )
export const addSpace = (str) => str + '\n'
export const prettier = (str) =>
  addSpace(
    str
      .replaceAll('];', '];\n')
      .replaceAll(';', '; ')
      .replaceAll('; ;', ';;')
      .replaceAll('[', ' [')
      .replaceAll('|', '| ')
      .replaceAll('| >', '\n|>')
      .replaceAll('.. [', '.. [\n')
      .replaceAll('; :=', ';\n:=')
  )
