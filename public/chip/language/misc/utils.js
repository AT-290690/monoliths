import { compileToJs } from '../core/compiler.js'
import { parse } from '../core/parser.js'
import { runFromAST } from '../core/interpreter.js'
import { tokens } from '../core/tokens.js'
import { STD, protolessModule } from '../extensions/extentions.js'
import { removeNoCode, wrapInBody } from './helpers.js'
import Brrr from '../extensions/Brrr.js'
export const languageUtilsString = `const _tco = func => (...args) => { let result = func(...args); while (typeof result === 'function') { result = result(); }; return result }, _pipe = (...fns) => x => fns.reduce((v, f) => f(v), x),
_spreadArr = (args) => {
  if (Brrr.isBrrr(args[0])) {
    const [first, ...rest] = args
    return first.merge(...rest)
  } else return args.reduce((acc, item) => ({ ...acc, ...item }), {})
}, _difference = (a, b) => a.difference(b), _intersection = (a, b) => a.intersection(b), _xor = (a, b) => a.xor(b), _union = (a, b) => a.union(b), _fill = (n) => Brrr.from(Array.from({ length: n }).fill(null).map((_, i) => i)),  _findIndexLeft = (a, cb) => a.findIndex(cb), _findIndexRight = (a, cb) => a.findLastIndex(cb), 
_mapEntries = (map) => Brrr.from([...map.entries()].map(Brrr.from)), _mapKeys = (map) => Brrr.from([...map.keys()]), _mapValues = (map) => Brrr.from([...map.values()]), _mapGet = (map, key) => map.get(key), _mapSize = (map) => map.size,
_mapRemove = (map, key) => { map.delete(key); return map }, _mapSet = (map, key, value) => { map.set(key, value); return map }, _mapHas = (map, key) => map.has(key), _scanLeft = (a, cb) => { for (let i = 0; i < a.length; ++i) cb(a.get(i), i, a); return a },
_scanRight = (a, cb) => {  for (let i = a.length - 1; i >= 0; --i) cb(a.get(i), i, a); return a }, _mapLeft = (a, cb, copy = new Brrr()) => { for (let i = 0; i < a.length; ++i) copy.set(i, cb(a.at(i), i, a)); return a.balance() },
_mapRight = (a, cb, copy = new Brrr()) => {  for (let i = a.length - 1; i >= 0; --i) copy.set(i, cb(a.at(i), i, a)); return a.balance() } , _filter = (a, cb) => a.filter(cb) , _reduceLeft = (a, cb, out = []) => a.reduce(cb, out),
_reduceRight = (a, cb, out = []) => a.reduceRight(cb, out), _findLeft = (a, cb) => a.find(cb), _findRight = (a, cb) => a.findLast(cb), _repeat = (n, cb) => { let out; for (let i = 0; i < n; ++i) out = cb(); return out }, 
_every = (a, cb) => a.every(cb), _some = (a, cb) => a.some(cb), _append = (a, value) => a.append(value), _prepend = (a, value) => a.prepend(value), _head = (a) => a.head(), _tail = (a) => a.tail(), _cut = (a) => a.cut(), 
_chop = (a) => a.chop(), _slice = (a, n1, n2) => a.slice(n1, n2), _length = (a) => a.length, _split = (string, separator) => Brrr.from(string.split(separator)), _join = (arr, separator) => arr.join(separator), _at = (a, i) => a.at(i), _set = (a, i, value) => a.set(i, value), 
_partition = (a, parts) => a.partition(parts), _mSort = (a, cb) => a.mergeSort(cb), _qSort = (a, dir) => a.quickSort(dir), _grp = (a, cb) => a.group(cb), _rot = (a, n, dir) => a.rotate(n, dir), _flatMap = (a, cb) => a.flatten(cb), _call = (x, cb) => cb(x),
_flat = (a, n) => a.flat(n), call = (x, fn) => fn(x), printout = (...args) => console.log(...args), protolessModule = methods => { const env = Object.create(null); for (const method in methods) env[method] = methods[method]; return env }, _addAt = (a, i, v) => a.addAt(i, ...v), _removeFrom = (a, i, n) => a.removeFrom(i, n);`
export const brrrHelpers = `
/**  Helper functions */
/** 
  If Type(x) is different from Type(y), return false.
  If Type(x) is Number, then
  If x is NaN and y is NaN, return true.
  If x is +0 and y is -0, return true.
  If x is -0 and y is +0, return true.
  If x is the same Number value as y, return true.
  Return false.
  Return SameValueNonNumber(x, y).
*/
const _sameValueZero = (x, y) => x === y || (Number.isNaN(x) && Number.isNaN(y))
const _clamp = (num, min, max) => Math.min(Math.max(num, min), max)
const _isIterable = iter =>
  iter === null || iter === undefined
    ? false
    : typeof iter[Symbol.iterator] === 'function'

const _tailCallOptimisedRecursion =
  func =>
  (...args) => {
    let result = func(...args)
    while (typeof result === 'function') result = result()
    return result
  }

const _flatten = (collection, levels, flat) =>
  collection.reduce((acc, current) => {
    if (Brrr.isBrrr(current)) acc.push(...flat(current, levels))
    else acc.push(current)
    return acc
  }, [])

const _toMatrix = (...args) => {
  if (args.length === 0) return
  const dimensions = new Brrr().with(...args)
  const dim = dimensions.chop()
  const arr = new Brrr()
  for (let i = 0; i < dim; ++i) arr.set(i, _toMatrix(...dimensions))
  return arr
}

const _toArrayDeep = entity => {
  return Brrr.isBrrr(entity)
    ? entity
        .map(item =>
          Brrr.isBrrr(item)
            ? item.some(Brrr.isBrrr)
              ? _toArrayDeep(item)
              : item.toArray()
            : item
        )
        .toArray()
    : entity
}

const _toObjectDeep = entity => {
  return Brrr.isBrrr(entity)
    ? entity
        .map(item =>
          Brrr.isBrrr(item)
            ? item.some(Brrr.isBrrr)
              ? _toObjectDeep(item)
              : item.toObject()
            : item
        )
        .toObject()
    : entity
}
const _toShapeDeep = (entity, out = []) => {
  if (Brrr.isBrrr(entity.get(0))) {
    entity.forEach(item => {
      out.push(_toShapeDeep(item))
    })
  } else {
    out = [entity.length]
  }
  return out
}

const _quickSortAsc = (items, left, right) => {
  if (items.length > 1) {
    let pivot = items.get(((right + left) / 2) | 0.5),
      i = left,
      j = right
    while (i <= j) {
      while (items.get(i) < pivot) ++i
      while (items.get(j) > pivot) j--
      if (i <= j) {
        items.swap(i, j)
        ++i
        j--
      }
    }
    if (left < i - 1) _quickSortAsc(items, left, i - 1)
    if (i < right) _quickSortAsc(items, i, right)
  }
  return items
}

const _quickSortDesc = (items, left, right) => {
  if (items.length > 1) {
    let pivot = items.get(((right + left) / 2) | 0.5),
      i = left,
      j = right
    while (i <= j) {
      while (items.get(i) > pivot) ++i
      while (items.get(j) < pivot) j--
      if (i <= j) {
        items.swap(i, j)
        ++i
        j--
      }
    }
    if (left < i - 1) _quickSortDesc(items, left, i - 1)
    if (i < right) _quickSortDesc(items, i, right)
  }
  return items
}

const _merge = (left, right, callback) => {
  const arr = []
  while (left.length && right.length) {
    callback(right.at(0), left.at(0)) > 0
      ? arr.push(left.chop())
      : arr.push(right.chop())
  }

  for (let i = 0; i < left.length; ++i) {
    arr.push(left.get(i))
  }
  for (let i = 0; i < right.length; ++i) {
    arr.push(right.get(i))
  }
  const out = new Brrr()
  const half = (arr.length / 2) | 0.5
  for (let i = half - 1; i >= 0; --i) out.prepend(arr[i])
  for (let i = half; i < arr.length; ++i) out.append(arr[i])
  return out
}

const _mergeSort = (array, callback) => {
  const half = (array.length / 2) | 0.5
  if (array.length < 2) {
    return array
  }
  const left = array.splice(0, half)
  return _merge(
    _mergeSort(left, callback),
    _mergeSort(array, callback),
    callback
  )
}

const _binarySearch = _tailCallOptimisedRecursion(
  (arr, target, by, greather, start, end) => {
    if (start > end) return undefined
    const index = ((start + end) / 2) | 0.5
    const current = arr.get(index)
    if (current === undefined) return undefined
    const identity = by(current)
    if (identity === target) return current
    if (greather(current))
      return _binarySearch(arr, target, by, greather, start, index - 1)
    else return _binarySearch(arr, target, by, greather, index + 1, end)
  }
)
const _Identity = current => current
class _Group {
  constructor() {
    this.items = {}
  }
  get(key) {
    return this.items[key]
  }
  set(key, value) {
    this.items[key] = value
    return this
  }
  get values() {
    return Object.values(this.items)
  }
  get keys() {
    return Object.keys(this.items)
  }
  has(key) {
    return key in this.items
  }
  forEntries(callback) {
    for (let key in this.items) {
      callback([key, this.items[key]], this.items)
    }
    return this
  }
  forEach(callback) {
    for (let key in this.items) {
      callback(this.items[key], key)
    }
    return this
  }
  map(callback) {
    for (let key in this.items) {
      this.items[key] = callback(this.items[key], key, this.items)
    }
    return this
  }
}

const _isEqual = (a, b) => {
  if (a === b) return true
  if (a && b && typeof a == 'object' && typeof b == 'object') {
    if (a.constructor !== b.constructor) return false
    let length, i, keys
    if (Brrr.isBrrr(a) && Brrr.isBrrr(b)) {
      length = a.length
      if (length != b.length) return false
      for (i = length; i-- !== 0; )
        if (!_isEqual(a.get(i), b.get(i))) return false
      return true
    }
    if (Array.isArray(a)) {
      length = a.length
      if (length != b.length) return false
      for (i = length; i-- !== 0; ) if (!_isEqual(a[i], b[i])) return false
      return true
    }
    if (a instanceof Map && b instanceof Map) {
      if (a.size !== b.size) return false
      for (i of a.entries()) if (!b.has(i[0])) return false
      for (i of a.entries()) if (!_isEqual(i[1], b.get(i[0]))) return false
      return true
    }
    if (a instanceof Set && b instanceof Set) {
      if (a.size !== b.size) return false
      for (i of a.entries()) if (!b.has(i[0])) return false
      return true
    }
    if (ArrayBuffer.isView(a) && ArrayBuffer.isView(b)) {
      length = a.length
      if (length != b.length) return false
      for (i = length; i-- !== 0; ) if (a[i] !== b[i]) return false
      return true
    }
    if (a.constructor === RegExp)
      return a.source === b.source && a.flags === b.flags
    if (a.valueOf !== Object.prototype.valueOf)
      return a.valueOf() === b.valueOf()
    if (a.toString !== Object.prototype.toString)
      return a.toString() === b.toString()
    keys = Object.keys(a)
    length = keys.length
    if (length !== Object.keys(b).length) return false
    for (i = length; i-- !== 0; )
      if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false
    for (i = length; i-- !== 0; ) {
      let key = keys[i]
      if (!_isEqual(a[key], b[key])) return false
    }
    return true
  }
  // true if both NaN, false otherwise
  return a !== a && b !== b
}

class _Shadow {
  isShortCircuited() {
    return true
  }
}
for (const method of Brrr.from([
  ...Object.getOwnPropertyNames(Brrr),
  ...Object.getOwnPropertyNames(Brrr.prototype),
]).without('prototype', 'isShortCircuited', 'constructor').items) {
  _Shadow.prototype[method] = () => _shadow
}
const _shadow = Object.freeze(new _Shadow())`
export const logBoldMessage = (msg) => console.log('\x1b[1m', msg)
export const logErrorMessage = (msg) =>
  console.log('\x1b[31m', '\x1b[1m', msg, '\x1b[0m')
export const logSuccessMessage = (msg) =>
  console.log('\x1b[32m', '\x1b[1m', msg, '\x1b[0m')
export const logWarningMessage = (msg) =>
  console.log('\x1b[33m', '\x1b[1m', msg, '\x1b[0m')

const findParent = (ast) => {
  let out = { fn: null, res: null }
  for (const prop in ast)
    if (Array.isArray(ast[prop]))
      for (const arg of ast[prop]) {
        if (arg.type === 'apply') out.fn = arg.operator.name
        const temp = findParent(arg)
        if (temp.res !== undefined) out.res = temp.res
      }
    else if (ast[prop] !== undefined) out.res = ast[prop]
  return out
}

export const runFromInterpreted = (source) => run(removeNoCode(source))
export const runFromCompiled = (source) => eval(compileModule(source))

export const exe = (source, extensions) => {
  if (extensions) for (const ext in extensions) STD[ext] = extensions[ext]
  const ENV = protolessModule(STD)
  ENV[';;tokens'] = protolessModule(tokens)
  const AST = parse(wrapInBody(source))
  const { result } = runFromAST(AST, ENV)
  return result
}
export const isBalancedParenthesis = (sourceCode) => {
  let count = 0
  const stack = []
  const str = sourceCode.replace(/"(.*?)"/g, '')
  const pairs = { ']': '[' }
  for (let i = 0; i < str.length; ++i)
    if (str[i] === '[') stack.push(str[i])
    else if (str[i] in pairs) if (stack.pop() !== pairs[str[i]]) count++
  return { str, diff: count - stack.length }
}
export const handleUnbalancedParens = (sourceCode) => {
  const parenMatcher = isBalancedParenthesis(sourceCode)
  if (parenMatcher.diff !== 0)
    throw new SyntaxError(
      `Parenthesis are unbalanced by ${parenMatcher.diff > 0 ? '+' : ''}${
        parenMatcher.diff
      } "]"`
    )
}
// -export const run = source => {
//   -  const sourceCode = removeNoCode(source.toString().trim())
//   -  handleUnbalancedParens(sourceCode)
//   -  return exe(sourceCode)
//   -}
//   +expo
export const run = (source, extensions) => {
  const sourceCode = removeNoCode(source.toString().trim())
  handleUnbalancedParens(sourceCode)
  return exe(sourceCode, extensions)
}

export const handleHangingSemi = (source) => {
  const code = source.trim()
  return code[code.length - 1] === ';' ? code : code + ';'
}

export const treeShake = (modules) => {
  let lib = ''
  const dfs = (modules, lib, LIBRARY) => {
    for (const key in modules) {
      if (key !== 'LIBRARY' && modules[key] !== undefined) {
        lib += '["' + key + '"]:{'
        for (const method of modules[key]) {
          if (LIBRARY[key]) {
            const current = LIBRARY[key][method]
            if (current) {
              if (typeof current === 'object') {
                lib += dfs({ [method]: modules[method] }, '', LIBRARY[key])
              } else {
                lib += '["' + method + '"]:'
                lib += current.toString()
                lib += ','
              }
            }
          }
        }
        lib += '},'
      }
    }
    return lib
  }
  lib += 'const LIBRARY = {' + dfs(modules, lib, STD.LIBRARY) + '}'
  return lib
}
export const compilePlain = (source) => {
  const inlined = wrapInBody(removeNoCode(source))
  const { top, program, modules } = compileToJs(parse(inlined))
  const lib = treeShake(modules)
  return `${lib};
${top}
${program}`
}
export const compileModule = (source) => {
  const inlined = wrapInBody(removeNoCode(source))
  const { top, program, modules } = compileToJs(parse(inlined))
  const lib = treeShake(modules)
  return `const VOID = 0;
${Brrr.toString()}
${brrrHelpers}
${languageUtilsString}
${lib};
${top}${program}`
}
export const compileBuild = (source) => {
  const inlined = wrapInBody(removeNoCode(source))
  const { top, program, modules } = compileToJs(parse(inlined))
  const lib = treeShake(modules)
  return `const VOID = 0;
${languageUtilsString}
${lib};
${top}async function entry(){${program.substring(6, program.length - 4)}}`
}
export const compileHtml = (
  source,
  scripts = `<script
src="https://cdnjs.cloudflare.com/ajax/libs/two.js/0.8.10/two.min.js"
integrity="sha512-D9pUm3+gWPkv/Wl6vd45vRLjdkdEKGje7BxOxYG0N6m4UlEUB7RSljBwpmJNAOuf6txLLtlaRchoKfzngr/bQg=="
crossorigin="anonymous"
referrerpolicy="no-referrer"
></script>`
) => {
  const inlined = wrapInBody(removeNoCode(source))
  const { top, program, modules } = compileToJs(parse(inlined))
  const lib = treeShake(modules)
  return `
<style>body { background: #0e0e0e } </style><body>
${scripts}
<script>
${Brrr.toString()}
${brrrHelpers}
const VOID = 0;
${languageUtilsString}
</script>
<script>${lib}</script>
<script> (() => { ${top}${program} })()</script>
</body>`
}
export const compileHtmlModule = (
  source,
  scripts = `<script
src="https://cdnjs.cloudflare.com/ajax/libs/two.js/0.8.10/two.min.js"
integrity="sha512-D9pUm3+gWPkv/Wl6vd45vRLjdkdEKGje7BxOxYG0N6m4UlEUB7RSljBwpmJNAOuf6txLLtlaRchoKfzngr/bQg=="
crossorigin="anonymous"
referrerpolicy="no-referrer"
></script>`
) => {
  const inlined = wrapInBody(removeNoCode(source))
  const { top, program, modules } = compileToJs(parse(inlined))
  const lib = treeShake(modules)
  return `
<style>body { background: #0e0e0e } </style><body>
${scripts}
<script type="module">
  import Brrr from '../../chip/language/extensions/Brrr.js'; 
  const VOID = 0;
  ${languageUtilsString};
  ${lib};
  (() => { ${top}${program} })()
 </script>
</body>`
}
export const interpredHtml = (
  source,
  utils = '../language/misc/utils.js',
  scripts = `<script
  src="https://cdnjs.cloudflare.com/ajax/libs/two.js/0.8.10/two.min.js"
  integrity="sha512-D9pUm3+gWPkv/Wl6vd45vRLjdkdEKGje7BxOxYG0N6m4UlEUB7RSljBwpmJNAOuf6txLLtlaRchoKfzngr/bQg=="
  crossorigin="anonymous"
  referrerpolicy="no-referrer"
  ></script>`
) => {
  const inlined = wrapInBody(removeNoCode(source))
  return `<style>body { background: black } </style>
  ${scripts}
<script type="module">
${Brrr.toString()}
${brrrHelpers}
import { exe } from '${utils}'; 
  try { 
    exe('${inlined}') 
  } catch(err) {
    console.error(err.message) 
  }
</script>
</body>`
}

export const compileExecutable = (source, ctx) => {
  const inlined = wrapInBody(removeNoCode(source))
  const ENV = protolessModule(ctx)
  ENV[';;tokens'] = protolessModule(tokens)
  delete ENV[';;tokens']['<-']
  const AST = parse(inlined)
  // const { AST } = cell(ENV, false)(inlined)
  const { top, program, modules } = compileToJs(AST, ctx)
  const lib = treeShake(modules)
  return `const VOID = 0;
  ${Brrr.toString()}
  ${brrrHelpers}
  ${languageUtilsString}
  ${lib};
  ${top}${program}`
}
