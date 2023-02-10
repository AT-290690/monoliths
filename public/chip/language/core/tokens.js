import { evaluate } from './interpreter.js'
import Brrr from '../extensions/Brrr.js'
export const VOID = 0
export const pipe =
  (...fns) =>
  (x) =>
    fns.reduce((v, f) => f(v), x)
const extract = (item, env) =>
  item.type === 'value' ? item.value : evaluate(item, env)
const MAX_KEY = 10
const tokens = {
  ['+']: (args, env) => {
    if (args.length < 2)
      throw new RangeError('Invalid number of arguments to +')
    const operands = args.map((a) => evaluate(a, env))
    if (operands.some((n) => typeof n !== 'number'))
      throw new TypeError('Invalid use of + (Not all args are numbers)')
    const [first, ...rest] = operands
    return rest.reduce((acc, x) => (acc += x), first)
  },
  ['-']: (args, env) => {
    if (args.length < 2)
      throw new RangeError('Invalid number of arguments to -')
    const operands = args.map((a) => evaluate(a, env))
    if (operands.some((n) => typeof n !== 'number'))
      throw new TypeError('Invalid use of - (Not all args are numbers)')
    const [first, ...rest] = operands
    return rest.reduce((acc, x) => (acc -= x), first)
  },
  ['*']: (args, env) => {
    if (args.length < 2)
      throw new RangeError('Invalid number of arguments to *')
    const operands = args.map((a) => evaluate(a, env))
    if (operands.some((n) => typeof n !== 'number'))
      throw new TypeError('Invalid use of * (Not all args are numbers)')
    const [first, ...rest] = operands
    return rest.reduce((acc, x) => (acc *= x), first)
  },
  [':']: (args, env) => {
    if (args.length < 2)
      throw new RangeError('Invalid number of arguments to :')
    const operands = args.map((a) => evaluate(a, env))
    if (operands.some((n) => typeof n !== 'number'))
      throw new TypeError('Invalid use of : (Not all args are numbers)')
    const [first, ...rest] = operands
    if (rest.includes(0))
      throw new RangeError('Invalid operation to : (devision by zero)')
    return rest.reduce((acc, x) => (acc /= x), first)
  },
  ['%']: (args, env) => {
    if (args.length !== 2)
      throw new RangeError('Invalid number of arguments to %')
    const operands = args.map((a) => evaluate(a, env))
    if (operands.some((n) => typeof n !== 'number'))
      throw new TypeError('Invalid use of % (Not all args are numbers)')
    const [left, right] = operands
    return left % right
  },
  ['|']: (args, env) => {
    if (!args.length || args.length > 2)
      throw new RangeError('Invalid number of arguments to |')
    const rounder = args.length === 1 ? 0 : evaluate(args[1], env)
    const operand = evaluate(args[0], env)
    if (typeof operand !== 'number' || typeof rounder !== 'number')
      throw new TypeError('Invalid use of | (Not all args are numbers)')
    return +operand.toFixed(rounder)
  },
  ['~']: (args, env) => {
    if (args.length < 2)
      throw new RangeError('Invalid number of arguments to ~')
    const operands = args.map((a) => evaluate(a, env))
    if (operands.some((n) => typeof n !== 'string'))
      throw new TypeError('Invalid use of ~ (Not all args are strings)')
    const [first, ...rest] = operands
    return rest.reduce((acc, x) => (acc += x), first)
  },
  ['?']: (args, env) => {
    if (args.length > 3 || args.length <= 1)
      throw new RangeError('Invalid number of arguments to ?')
    if (!!evaluate(args[0], env)) return evaluate(args[1], env)
    else if (args[2]) return evaluate(args[2], env)
    else return 0
  },
  ['!']: (args, env) => {
    if (args.length !== 1)
      throw new RangeError('Invalid number of arguments to !')
    return +!extract(args[0], env)
  },
  ['==']: (args, env) => {
    if (args.length < 2)
      throw new RangeError('Invalid number of arguments to ==')
    const [first, ...rest] = args.map((a) => evaluate(a, env))
    return +rest.every((x) => first === x)
  },
  ['!=']: (args, env) => {
    if (args.length < 2)
      throw new RangeError('Invalid number of arguments to !=')
    const [first, ...rest] = args.map((a) => evaluate(a, env))
    return +rest.every((x) => first !== x)
  },
  ['>']: (args, env) => {
    if (args.length < 2)
      throw new RangeError('Invalid number of arguments to >')
    const [first, ...rest] = args.map((a) => evaluate(a, env))
    return +rest.every((x) => first > x)
  },
  ['<']: (args, env) => {
    if (args.length < 2)
      throw new RangeError('Invalid number of arguments to <')
    const [first, ...rest] = args.map((a) => evaluate(a, env))
    return +rest.every((x) => first < x)
  },
  ['>=']: (args, env) => {
    if (args.length < 2)
      throw new RangeError('Invalid number of arguments to >=')
    const [first, ...rest] = args.map((a) => evaluate(a, env))
    return +rest.every((x) => first >= x)
  },
  ['<=']: (args, env) => {
    if (args.length < 2)
      throw new RangeError('Invalid number of arguments to <=')
    const [first, ...rest] = args.map((a) => evaluate(a, env))
    return +rest.every((x) => first <= x)
  },
  ['&&']: (args, env) => {
    if (args.length === 0)
      throw new RangeError('Invalid number of arguments to &&')
    for (let i = 0; i < args.length - 1; ++i)
      if (!!evaluate(args[i], env)) continue
      else return evaluate(args[i], env)
    return evaluate(args[args.length - 1], env)
  },
  ['||']: (args, env) => {
    if (args.length === 0)
      throw new RangeError('Invalid number of arguments  to ||')
    for (let i = 0; i < args.length - 1; ++i)
      if (!!evaluate(args[i], env)) return evaluate(args[i], env)
      else continue
    return evaluate(args[args.length - 1], env)
  },
  ['..']: (args, env) => {
    let value = VOID
    args.forEach((arg) => (value = evaluate(arg, env)))
    return value
  },
  [':=']: (args, env) => {
    if (!args.length)
      throw new SyntaxError('Invalid number of arguments for := []')
    let name
    for (let i = 0; i < args.length; ++i) {
      if (i % 2 === 0) {
        const word = args[i]
        if (word.type !== 'word')
          throw new SyntaxError(
            `First argument of := [] must be word but got ${word.type ?? VOID}`
          )
        name = word.name
        if (name.includes('.') || name.includes('-'))
          throw new SyntaxError(
            `Invalid use of operation := [] [variable name must not contain . or -] but got ${name}`
          )
      } else {
        env[name] = evaluate(args[i], env)
      }
    }
    return env[name]
  },
  ['<-::']: (args, env) => {
    if (!args.length)
      throw new SyntaxError('Invalid number of arguments for <-:: []')
    const obj = evaluate(args.pop(), env)
    if (!(obj instanceof Map))
      throw new TypeError(`:: ${obj} is not a instance of :: at <-::`)
    let names = []
    for (let i = 0; i < args.length; ++i) {
      const word = args[i]
      if (word.type !== 'word')
        throw new SyntaxError(
          `First argument of <-:: [] must be word but got ${word.type ?? VOID}`
        )
      if (word.name.includes('.') || word.name.includes('-'))
        throw new SyntaxError(
          `Invalid use of operation <-:: [] [variable name must not contain . or -] but got ${name}`
        )
      names.push(word.name)
    }
    names.forEach((name) => {
      if (obj.has(name)) env[name] = obj.get(name)
      else
        throw new TypeError(
          `Key ${name} must be one of ${[...obj.keys()]} at operation <-:: []`
        )
    })
    return VOID
  },
  ['<-.:']: (args, env) => {
    if (!args.length)
      throw new SyntaxError('Invalid number of arguments for <-.: []')
    const obj = evaluate(args.pop(), env)
    if (!(obj.constructor.name === 'Brrr'))
      throw new TypeError(`.: ${obj} is not a instance of .:`)
    let names = []
    for (let i = 0; i < args.length; ++i) {
      const word = args[i]
      if (word.type !== 'word')
        throw new SyntaxError(
          `First argument of <-.: [] must be word but got ${word.type ?? VOID}`
        )
      if (word.name.includes('.') || word.name.includes('-'))
        throw new SyntaxError(
          `Invalid use of operation <-.: [] [variable name must not contain . or -] but got ${name}`
        )
      names.push(word.name)
    }

    names.forEach((name, i) => {
      if (i === names.length - 1) env[name] = obj.slice(i)
      else env[name] = obj.at(i)
    })
    return VOID
  },
  ['=']: (args, env) => {
    if (args.length !== 2)
      throw new RangeError('Invalid number of arguments for = []')
    if (args[0].type !== 'word')
      throw new TypeError('Argument for = [] must be words')
    const entityName = args[0].name
    const value = evaluate(args[1], env)
    for (let scope = env; scope; scope = Object.getPrototypeOf(scope))
      if (Object.prototype.hasOwnProperty.call(scope, entityName)) {
        scope[entityName] = value
        return value
      }
    throw new ReferenceError(
      `Tried setting an undefined variable: ${entityName} using = []`
    )
  },
  ['->']: (args, env) => {
    if (!args.length) throw new SyntaxError('-> [] need a body')
    const argNames = args.slice(0, args.length - 1).map((expr) => {
      if (expr.type !== 'word')
        throw new TypeError('Argument names of -> [] must be words')
      return expr.name
    })
    const body = args[args.length - 1]
    return (...args) => {
      //     if (args.length !== argNames.length)
      //       throw new TypeError(
      //         'Invalid number of arguments for -> [] near ["' +
      //           argNames.join('; ') +
      //           '"]'
      //       )
      const localEnv = Object.create(env)
      for (let i = 0; i < args.length; ++i) localEnv[argNames[i]] = args[i]
      return evaluate(body, localEnv)
    }
  },
  ['>-']: (args, env) => {
    if (args.length !== 2)
      throw new RangeError('Invalid number of arguments to >-')
    const array = evaluate(args[0], env)
    if (!(array.constructor.name === 'Brrr'))
      throw new TypeError('First argument of >- must be an .: []')
    const callback = evaluate(args[1], env)
    if (typeof callback !== 'function')
      throw new TypeError('Second argument of >- must be an -> []')
    return array.filter(callback)
  },
  ['>_']: (args, env) => {
    if (args.length !== 3)
      throw new RangeError('Invalid number of arguments to >_')
    const array = evaluate(args[0], env)
    if (!(array.constructor.name === 'Brrr'))
      throw new TypeError('First argument of >_ must be an .: []')
    const callback = evaluate(args[1], env)
    if (typeof callback !== 'function')
      throw new TypeError('Second argument of >_ must be an -> []')
    return array.reduce(callback, evaluate(args[2], env))
  },
  ['_<']: (args, env) => {
    if (args.length !== 3)
      throw new RangeError('Invalid number of arguments to _<')
    const array = evaluate(args[0], env)
    if (!(array.constructor.name === 'Brrr'))
      throw new TypeError('First argument of _< must be an .: []')
    const callback = evaluate(args[1], env)
    if (typeof callback !== 'function')
      throw new TypeError('Second argument of _< must be an -> []')
    return array.reduceRight(callback, evaluate(args[2], env))
  },
  ['>>']: (args, env) => {
    if (args.length !== 2)
      throw new RangeError('Invalid number of arguments to >>')
    const array = evaluate(args[0], env)
    if (!(array.constructor.name === 'Brrr'))
      throw new TypeError('First argument of >> must be an .: []')
    const callback = evaluate(args[1], env)
    if (typeof callback !== 'function')
      throw new TypeError('Second argument of >> must be an -> []')
    return array.scan(callback, 1)
  },
  ['>>.']: (args, env) => {
    if (args.length !== 2)
      throw new RangeError('Invalid number of arguments to >>.')
    const array = evaluate(args[0], env)
    if (!(array.constructor.name === 'Brrr'))
      throw new TypeError('First argument of >>. must be an .: []')
    const callback = evaluate(args[1], env)
    if (typeof callback !== 'function')
      throw new TypeError('Second argument of >>. must be an -> []')
    const copy = new Brrr()
    for (let i = 0; i < array.length; ++i)
      copy.set(i, callback(array.get(i), i, array))
    return copy
  },
  ['>>_']: (args, env) => {
    if (args.length !== 2)
      throw new RangeError('Invalid number of arguments to >>.')
    const array = evaluate(args[0], env)
    if (!(array.constructor.name === 'Brrr'))
      throw new TypeError('First argument of >>. must be an .: []')
    const callback = evaluate(args[1], env)
    if (typeof callback !== 'function')
      throw new TypeError('Second argument of >>. must be an -> []')
    return array.flatten(callback)
  },
  ['<<']: (args, env) => {
    if (args.length !== 2)
      throw new RangeError('Invalid number of arguments to <<')
    const array = evaluate(args[0], env)
    if (!(array.constructor.name === 'Brrr'))
      throw new TypeError('First argument of << must be an .: []')
    const callback = evaluate(args[1], env)
    if (typeof callback !== 'function')
      throw new TypeError('Second argument of << must be an -> []')
    return array.scan(callback, -1)
  },
  ['.<<']: (args, env) => {
    if (args.length !== 2)
      throw new RangeError('Invalid number of arguments to .<<')
    const array = evaluate(args[0], env)
    if (!(array.constructor.name === 'Brrr'))
      throw new TypeError('First argument of .<< must be an .: []')
    const callback = evaluate(args[1], env)
    if (typeof callback !== 'function')
      throw new TypeError('Second argument of .<< must be an -> []')
    const copy = new Brrr()
    const len = array.length - 1
    for (let i = len; i >= 0; --i)
      copy.set(len - i, callback(array.get(i), i, array))
    return copy
  },
  ['===']: (args, env) => {
    if (args.length < 2)
      throw new RangeError('Invalid number of arguments to ===')
    const [f, ...rest] = args.map((a) => evaluate(a, env))
    const first = Brrr.of(f)
    return +rest.every((x) => first.isEqual(Brrr.of(x)))
  },
  ['!==']: (args, env) => {
    if (args.length < 2)
      throw new RangeError('Invalid number of arguments to !==')
    const [f, ...rest] = args.map((a) => evaluate(a, env))
    const first = Brrr.of(f)
    return +rest.every((x) => !first.isEqual(Brrr.of(x)))
  },
  ['<>']: (args, env) => {
    if (args !== 2) {
      if (args.length < 2)
        throw new RangeError('Invalid number of arguments to <>')
    }
    const a = evaluate(args[0], env)
    if (!(a.constructor.name === 'Brrr'))
      throw new TypeError('First argument of <> must be an .: []')
    const b = evaluate(args[1], env)
    if (!(b.constructor.name === 'Brrr'))
      throw new TypeError('Second argument of <> must be an .: []')
    return a.difference(b)
  },
  ['><']: (args, env) => {
    if (args !== 2) {
      if (args.length < 2)
        throw new RangeError('Invalid number of arguments to ><')
    }
    const a = evaluate(args[0], env)
    if (!(a.constructor.name === 'Brrr'))
      throw new TypeError('First argument of >< must be an .: []')
    const b = evaluate(args[1], env)
    if (!(b.constructor.name === 'Brrr'))
      throw new TypeError('Second argument of >< must be an .: []')
    return a.intersection(b)
  },
  ['</>']: (args, env) => {
    if (args !== 2) {
      if (args.length < 2)
        throw new RangeError('Invalid number of arguments to </>')
    }
    const a = evaluate(args[0], env)
    if (!(a.constructor.name === 'Brrr'))
      throw new TypeError('First argument of </> must be an .: []')
    const b = evaluate(args[1], env)
    if (!(b.constructor.name === 'Brrr'))
      throw new TypeError('Second argument of </> must be an .: []')
    return a.xor(b)
  },
  ['.:.']: (args, env) => {
    if (args !== 2) {
      if (args.length < 2)
        throw new RangeError('Invalid number of arguments to .:.')
    }
    const a = evaluate(args[0], env)
    if (!(a.constructor.name === 'Brrr'))
      throw new TypeError('First argument of .:. must be an .: []')
    const b = evaluate(args[1], env)
    if (!(b.constructor.name === 'Brrr'))
      throw new TypeError('Second argument of .:. must be an .: []')
    return a.union(b)
  },
  ['~::']: (args, env) => {
    if (args.length !== 2)
      throw new RangeError('Invalid number of arguments to ~::')
    const array = evaluate(args[0], env)
    if (!(array.constructor.name === 'Brrr'))
      throw new TypeError('First argument of ~:: must be an .: []')
    const dir = evaluate(args[1], env)
    if (dir !== -1 && dir !== 1)
      throw new TypeError('Second argument of ~:: must be either -1 or 1')
    return array.quickSort(dir)
  },
  ['*::']: (args, env) => {
    if (args.length !== 2)
      throw new RangeError('Invalid number of arguments to *::')
    const array = evaluate(args[0], env)
    if (!(array.constructor.name === 'Brrr'))
      throw new TypeError('First argument of *:: must be an .: []')
    const callback = evaluate(args[1], env)
    if (typeof callback !== 'function')
      throw new TypeError('Second argument of *:: must be an -> []')
    return array.mergeSort(callback)
  },
  ['.::']: (args, env) => {
    if (args.length !== 2)
      throw new RangeError('Invalid number of arguments to .::')
    const array = evaluate(args[0], env)
    if (!(array.constructor.name === 'Brrr'))
      throw new TypeError('First argument of .:: must be an .: []')
    const callback = evaluate(args[1], env)
    if (typeof callback !== 'function')
      throw new TypeError('Second argument of .:: must be an -> []')
    return array.group(callback)
  },
  ['.:@']: (args, env) => {
    if (args.length !== 3)
      throw new RangeError('Invalid number of arguments to .:@')
    const array = evaluate(args[0], env)
    if (!(array.constructor.name === 'Brrr'))
      throw new TypeError('First argument of .:@ must be an .: []')
    const n = evaluate(args[1], env)
    if (typeof n !== 'number' || n < 0)
      throw new TypeError('Second argument of .:@ must be a positive number')
    const dir = evaluate(args[2], env)
    if (dir !== -1 && dir !== 1)
      throw new TypeError('Third argument of .:@ must be either -1 or 1')
    return array.rotate(n, dir)
  },
  ['_.']: (args, env) => {
    if (args.length !== 2)
      throw new RangeError('Invalid number of arguments to _.')
    const array = evaluate(args[0], env)
    if (!(array.constructor.name === 'Brrr'))
      throw new TypeError('First argument of _. must be an .: []')
    const level = evaluate(args[1], env)
    if (typeof level !== 'number' || level < 0)
      throw new TypeError('Second argument of _. must be a positive number')
    return array.flat(level)
  },
  ['.:*']: (args, env) => {
    if (args.length !== 3)
      throw new RangeError('Invalid number of arguments to .:*')
    const array = evaluate(args[0], env)
    if (!(array.constructor.name === 'Brrr'))
      throw new TypeError('First argument of .:* must be an .: []')
    const n1 = evaluate(args[1], env)
    if (typeof n1 !== 'number')
      throw new TypeError('Second argument of .:* must be a number')
    const n2 = evaluate(args[2], env)
    if (typeof n2 !== 'number')
      throw new TypeError('Third argument of .:* must be a number')
    return array.slice(n1, n2)
  },
  ['@']: (args, env) => {
    if (args.length !== 2)
      throw new RangeError('Invalid number of arguments to @')
    const n = evaluate(args[0], env)
    if (typeof n !== 'number')
      throw new TypeError('First argument of @ must be a number')
    const callback = evaluate(args[1], env)
    if (typeof callback !== 'function')
      throw new TypeError('Second argument of @ must be an -> []')
    let out
    for (let i = 0; i < n; ++i) out = callback()
    return out
  },
  ['>.:']: (args, env) => {
    if (args.length !== 2)
      throw new RangeError('Invalid number of arguments to >:.')
    const array = evaluate(args[0], env)
    if (!(array.constructor.name === 'Brrr'))
      throw new TypeError('First argument of >:. must be an .: []')
    const callback = evaluate(args[1], env)
    if (typeof callback !== 'function')
      throw new TypeError('Second argument of >:. must be an -> []')
    return array.findIndex(callback)
  },
  ['.:<']: (args, env) => {
    if (args.length !== 2)
      throw new RangeError('Invalid number of arguments to .:<')
    const array = evaluate(args[0], env)
    if (!(array.constructor.name === 'Brrr'))
      throw new TypeError('First argument of .:< must be an .: []')
    const callback = evaluate(args[1], env)
    if (typeof callback !== 'function')
      throw new TypeError('Second argument of .:< must be an -> []')
    return array.findLastIndex(callback)
  },
  ['><>']: (args, env) => {
    if (args.length !== 2)
      throw new RangeError('Invalid number of arguments to ><>')
    const array = evaluate(args[0], env)
    if (!(array.constructor.name === 'Brrr'))
      throw new TypeError('First argument of ><> must be an .: []')
    const callback = evaluate(args[1], env)
    if (typeof callback !== 'function')
      throw new TypeError('Second argument of ><> must be an -> []')
    return array.find(callback)
  },
  ['<><']: (args, env) => {
    if (args.length !== 2)
      throw new RangeError('Invalid number of arguments to <><')
    const array = evaluate(args[0], env)
    if (!(array.constructor.name === 'Brrr'))
      throw new TypeError('First argument of <>< must be an .: []')
    const callback = evaluate(args[1], env)
    if (typeof callback !== 'function')
      throw new TypeError('Second argument of <>< must be an -> []')
    return array.findLast(callback)
  },
  ['|:|']: (args, env) => {
    if (args.length !== 2)
      throw new RangeError('Invalid number of arguments to |:|')
    const array = evaluate(args[0], env)
    if (!(array.constructor.name === 'Brrr'))
      throw new TypeError('First argument of |:| must be an .: []')
    const callback = evaluate(args[1], env)
    if (typeof callback !== 'function')
      throw new TypeError('Second argument of |:| must be an -> []')
    return +array.every(callback)
  },
  ['|.|']: (args, env) => {
    if (args.length !== 2)
      throw new RangeError('Invalid number of arguments to |.|')
    const array = evaluate(args[0], env)
    if (!(array.constructor.name === 'Brrr'))
      throw new TypeError('First argument of |.| must be an .: []')
    const callback = evaluate(args[1], env)
    if (typeof callback !== 'function')
      throw new TypeError('Second argument of |.| must be an -> []')
    return +array.some(callback)
  },
  ['.>']: (args, env) => {
    if (args.length !== 1)
      throw new RangeError('Invalid number of arguments to .>')
    const array = evaluate(args[0], env)
    if (!(array.constructor.name === 'Brrr'))
      throw new TypeError('First argument of .> must be an .: []')
    return array.first
  },
  ['.<']: (args, env) => {
    if (args.length !== 1)
      throw new RangeError('Invalid number of arguments to .<')
    const array = evaluate(args[0], env)
    if (!(array.constructor.name === 'Brrr'))
      throw new TypeError('First argument of .< must be an .: []')
    return array.last
  },
  [':.']: (args, env) => {
    if (args.length !== 2)
      throw new RangeError('Invalid number of arguments to :.')
    const array = evaluate(args[0], env)
    if (!(array.constructor.name === 'Brrr'))
      throw new TypeError('First argument of :. must be an .: []')
    const index = evaluate(args[1], env)
    if (!Number.isInteger(index))
      throw new TypeError('Second argument of :. must be a number')
    if (!array.isInBounds(Math.abs(index)))
      throw new TypeError(
        `Index is out of bounds [${index}] <> .: [${array.length}]`
      )
    return array.at(index)
  },
  ['^=']: (args, env) => {
    if (args.length !== 3)
      throw new RangeError('Invalid number of arguments to ^=')
    const array = evaluate(args[0], env)
    if (!(array.constructor.name === 'Brrr'))
      throw new TypeError('First argument of  ^= must be an .: []')
    const index = evaluate(args[1], env)
    if (!Number.isInteger(index))
      throw new TypeError('Second argument of  ^= must be a number')
    if (!array.isInBounds(Math.abs(index)))
      throw new TypeError(
        `Index is out of bounds [${index}] <> .: [${array.length}]`
      )
    return array.set(index, evaluate(args[2], env))
  },
  ['...']: (args, env) => {
    if (!args.length) throw new RangeError('Invalid number of arguments to ...')
    const [first, ...rest] = args
    const toSpread = evaluate(first, env)
    if (!Brrr.isBrrr(toSpread))
      throw new SyntaxError('... can only be used on .:')
    return toSpread.merge(...rest.map((item) => evaluate(item, env)))
  },
  ['.:=']: (args, env) => {
    if (args.length !== 2)
      throw new RangeError('Invalid number of arguments to .:=')
    const array = evaluate(args[0], env)
    if (!(array.constructor.name === 'Brrr'))
      throw new TypeError('First argument of .:= must be an .: []')
    return array.append(evaluate(args[1], env))
  },
  [':+']: (args, env) => {
    if (args.length < 3)
      throw new RangeError('Invalid number of arguments to :+')
    const [first, second, ...rest] = args
    const array = evaluate(first, env)
    if (!(array.constructor.name === 'Brrr'))
      throw new TypeError('First argument of :+ must be an .: []')
    const index = evaluate(second, env)
    if (!Number.isInteger(index))
      throw new TypeError('Second argument of :+ must be a number')
    else if (!array.isInBounds(index))
      throw new RangeError(
        'Second argument of :+ must be withing the bounds of .: []'
      )
    return array.addAt(index, ...rest.map((item) => evaluate(item, env)))
  },
  [':-']: (args, env) => {
    if (args.length !== 3)
      throw new RangeError('Invalid number of arguments to :-')
    const array = evaluate(args[0], env)
    if (!(array.constructor.name === 'Brrr'))
      throw new TypeError('First argument of :- must be an .: []')
    const index = evaluate(args[1], env)
    if (!Number.isInteger(index))
      throw new TypeError('Second argument of :- must be a number')
    else if (!array.isInBounds(index))
      throw new RangeError(
        'Second argument of :- must be withing the bounds of .: []'
      )
    const amount = evaluate(args[2], env)
    if (!Number.isInteger(amount) || amount < 0)
      throw new TypeError('Third argument of :- must be a number >= 0')
    return array.removeFrom(index, amount)
  },
  ['=.:']: (args, env) => {
    if (args.length !== 2)
      throw new RangeError('Invalid number of arguments to =.:')
    const array = evaluate(args[0], env)
    if (!(array.constructor.name === 'Brrr'))
      throw new TypeError('First argument of =.: must be an .: []')
    return array.prepend(evaluate(args[1], env))
  },
  ['.:!=']: (args, env) => {
    if (args.length !== 1)
      throw new RangeError('Invalid number of arguments to .:!=')
    const array = evaluate(args[0], env)
    if (!(array.constructor.name === 'Brrr'))
      throw new TypeError('First argument of .:!= must be an .: []')
    return array.head()
  },
  ['!=.:']: (args, env) => {
    if (args.length !== 1)
      throw new RangeError('Invalid number of arguments to !=.:')
    const array = evaluate(args[0], env)
    if (!(array.constructor.name === 'Brrr'))
      throw new TypeError('First argument of !=.: must be an .: []')
    return array.tail()
  },
  ['|.']: (args, env) => {
    if (args.length !== 1)
      throw new RangeError('Invalid number of arguments to |.')
    const array = evaluate(args[0], env)
    if (!(array.constructor.name === 'Brrr'))
      throw new TypeError('First argument of |. must be an .: []')
    return array.cut()
  },
  ['.|']: (args, env) => {
    if (args.length !== 1)
      throw new RangeError('Invalid number of arguments to .|')
    const array = evaluate(args[0], env)
    if (!(array.constructor.name === 'Brrr'))
      throw new TypeError('First argument of .| must be an .: []')
    return array.chop()
  },
  ['::']: (args, env) => {
    let tempKey = ''
    return args.reduce((acc, item, i) => {
      if (i % 2) {
        acc.set(tempKey, extract(item, env))
      } else {
        const key = extract(item, env)
        if (typeof key !== 'string') {
          throw new SyntaxError(
            'Invalid use of operation :: (Only strings can be used as keys)'
          )
        } else if (key.length > MAX_KEY) {
          throw new RangeError(
            `Key name "${key}" is too long. Max length is ${MAX_KEY} characters!`
          )
        }
        tempKey = key
      }
      return acc
    }, new Map())
  },
  ['.?']: (args, env) => {
    const prop = []
    const entityName = args[0].name
    for (let i = 1; i < args.length; ++i) {
      const arg = args[i]
      const p = extract(arg, env)
      if (p == undefined)
        throw new TypeError(`Void key for accesing :: ${entityName}`)
      prop.push(extract(arg, env).toString())
    }
    for (let scope = env; scope; scope = Object.getPrototypeOf(scope))
      if (Object.prototype.hasOwnProperty.call(scope, entityName)) {
        if (
          scope[entityName] == undefined ||
          !(scope[entityName] instanceof Map)
        )
          throw new TypeError(`:: ${scope[entityName]} is not a instance of ::`)
        return +scope[entityName].has(prop[0])
      }
  },
  ['.']: (args, env) => {
    if (args.length !== 2)
      throw new RangeError('Invalid number of arguments for . []')
    const prop = []
    for (let i = 1; i < args.length; ++i) {
      const arg = args[i]
      const p = extract(arg, env)
      if (p == undefined)
        throw new TypeError(`Void key for accesing :: ${args[0].name}`)
      prop.push(extract(arg, env).toString())
    }
    if (args[0].type === 'apply' || args[0].type === 'value') {
      const entity = evaluate(args[0], env)
      if (entity == undefined || !entity.has(prop[0]))
        throw new RangeError(`:: ${entity.name} doesnt have a . of ${prop[0]}`)
      const entityProperty = entity.get(prop[0])
      if (typeof entityProperty === 'function') {
        const caller = entity
        const fn = entityProperty
        return fn.bind(caller)
      } else return entityProperty ?? VOID
    } else {
      const entityName = args[0].name
      for (let scope = env; scope; scope = Object.getPrototypeOf(scope))
        if (Object.prototype.hasOwnProperty.call(scope, entityName)) {
          if (
            scope[entityName] == undefined ||
            !(scope[entityName] instanceof Map)
          )
            throw new TypeError(
              `:: ${scope[entityName]} is not a instance of ::`
            )
          if (!scope[entityName].has(prop[0]))
            throw new RangeError(
              `:: ${entityName} doesnt have a . of ${prop[0]}`
            )
          const entityProperty = scope[entityName].get(prop[0])
          if (typeof entityProperty === 'function') {
            const caller = scope[entityName]
            const fn = entityProperty
            return fn.bind(caller)
          } else return entityProperty ?? VOID
        }
    }
  },
  ['.=']: (args, env) => {
    if (args.length !== 3)
      throw new RangeError('Invalid number of arguments for .= []')
    const main = args[0]
    const last = args[args.length - 1]
    const prop = []
    for (let i = 1; i < args.length - 1; ++i) {
      const arg = args[i]
      const p = extract(arg, env)
      if (p == undefined)
        throw new TypeError(`Void key for accesing :: ${args[0].name}`)
      prop.push(extract(arg, env).toString())
    }
    const value = evaluate(last, env)
    if (main.type === 'apply') {
      const entity = evaluate(main, env)
      if (entity == undefined || !(entity instanceof Map))
        throw new TypeError(`:: ${main.name} is not a instance of ::`)
      entity.set(prop[0], value)
      return entity
    } else if (main.type === 'word') {
      const entityName = main.name
      for (let scope = env; scope; scope = Object.getPrototypeOf(scope))
        if (Object.prototype.hasOwnProperty.call(scope, entityName)) {
          const entity = scope[entityName]
          if (entity == undefined || !(entity instanceof Map))
            throw new TypeError(`:: ${entityName} is not a instance of ::`)
          entity.set(prop[0], value)
          return entity
        }
    }
  },
  ['.!=']: (args, env) => {
    if (args.length !== 2)
      throw new RangeError('Invalid number of arguments for .!= []')
    const prop = []
    const entityName = args[0].name

    for (let i = 1; i < args.length; ++i) {
      const arg = args[i]
      const p = extract(arg, env)
      if (p == undefined)
        throw new TypeError(`Void key for accesing :: ${entityName}`)
      prop.push(extract(arg, env).toString())
    }
    for (let scope = env; scope; scope = Object.getPrototypeOf(scope))
      if (Object.prototype.hasOwnProperty.call(scope, entityName)) {
        let temp = scope[entityName]
        if (temp == undefined || !(temp instanceof Map))
          throw new TypeError(`:: ${entityName} is not a instance of ::`)
        temp.delete(prop[0])
        return temp
      }
  },
  ["'"]: (args, env) => {
    if (!args.length)
      throw new TypeErorr(`Invalid number of arguments for ' []`)
    args.forEach(({ name, type }) => {
      if (type !== 'word')
        throw new SyntaxError(
          `Invalid use of operation ' (Arguments must be words)`
        )
      if (name.includes('.') || name.includes('-'))
        throw new SyntaxError(
          `Invalid use of operation ' (variable name must not contain . or -)`
        )
      env[name] = name
    })
    return args[args.length - 1].name
  },
  [':::']: (args, env) => {
    if (args.length !== 1)
      throw new RangeError('Invalid number of arguments to :::')
    const map = evaluate(args[0], env)
    if (!(map.constructor.name === 'Map'))
      throw new TypeError('First argument of ::: must be an :: []')
    return Brrr.from([...map.entries()].map(Brrr.from))
  },
  ['::.']: (args, env) => {
    if (args.length !== 1)
      throw new RangeError('Invalid number of arguments to ::.')
    const map = evaluate(args[0], env)
    if (!(map.constructor.name === 'Map'))
      throw new TypeError('First argument of ::. must be an :: []')
    return Brrr.from([...map.keys()])
  },
  ['::*']: (args, env) => {
    if (args.length !== 1)
      throw new RangeError('Invalid number of arguments to ::* ')
    const map = evaluate(args[0], env)
    if (!(map.constructor.name === 'Map'))
      throw new TypeError('First argument of ::* must be an :: []')
    return Brrr.from([...map.values()])
  },
  ['.:']: (args, env) => Brrr.from(args.map((item) => extract(item, env))),
  ['.:+']: (args, env) => {
    if (args.length !== 1)
      throw new RangeError('Invalid number of arguments to .:+ ')
    const n = evaluate(args[0], env)
    if (typeof n !== 'number')
      throw new TypeError('Second argument of .:+ must be an number')
    return Brrr.from(
      Array.from({ length: n })
        .fill(null)
        .map((_, i) => i)
    )
  },
  ['<-']: (args, env) => (imp) => {
    args.forEach((arg) => {
      if (!arg.name)
        throw new TypeError(`import has to be a word but got ${method}`)
      const method = arg.name
      if (
        method.includes('constructor') ||
        method.includes('prototype') ||
        method.includes('__proto__')
      )
        throw new TypeError(`Forbidden property access ${method}`)

      env[method] = imp[method]
    })
    return VOID
  },
  ['|>']: (args, env) => {
    const [param, ...rest] = args
    return pipe(...rest.map((arg) => (p) => evaluate(arg, env)(p)))(
      param.type === 'apply' || param.type === 'word'
        ? evaluate(param, env)
        : param.value
    )
  },
  ['.-:']: (args, env) => {
    if (args.length !== 2)
      throw new RangeError('Invalid number of arguments to .-:')
    const string = evaluate(args[0], env)
    if (typeof string !== 'string')
      throw new TypeError('First argument of .-: must be a string')
    const separator = evaluate(args[1], env)
    if (typeof separator !== 'string')
      throw new TypeError('Second argument of .-: must be a string')
    return Brrr.from(string.split(separator))
  },
  ['.+:']: (args, env) => {
    if (args.length !== 2)
      throw new RangeError('Invalid number of arguments to .+:')
    const array = evaluate(args[0], env)
    if (!Brrr.isBrrr(array))
      throw new TypeError('First argument of .+: must be an .: []')
    const separator = evaluate(args[1], env)
    if (typeof separator !== 'string')
      throw new TypeError('Second argument of .+: must be a string')
    return array.join(separator)
  },
  [':+:']: (args, env) => {
    if (args.length !== 2)
      throw new RangeError('Invalid number of arguments to :+:')
    const array = evaluate(args[0], env)
    if (!Brrr.isBrrr(array))
      throw new TypeError('First argument of :+: must be an .: []')
    const n = evaluate(args[1], env)
    if (typeof n !== 'number')
      throw new TypeError('Second argument of :+: must be an number')
    return array.partition(n)
  },
  [':..']: (args, env) => {
    if (args.length < 1)
      throw new RangeError('Invalid number of arguments to :..')
    const dimensions = args.map((arg) => evaluate(arg, env))
    if (dimensions.some((d) => !Number.isInteger(d)))
      throw new TypeError('Argument of :.. must be integers')
    return Brrr.matrix(...dimensions)
  },
  ['.:?']: (args, env) => {
    if (args.length !== 1)
      throw new RangeError('Invalid number of arguments to .:?')
    const array = evaluate(args[0], env)
    if (!(array.constructor.name === 'Brrr'))
      throw new TypeError('First argument of .:? must be an .: []')
    return array.length
  },
  ['::?']: (args, env) => {
    if (args.length !== 1)
      throw new RangeError('Invalid number of arguments to ::?')
    const map = evaluate(args[0], env)
    if (!(map.constructor.name === 'Map'))
      throw new TypeError('First argument of ::? must be an :: []')
    return map.size
  },
  ['~=']: (args, env) => {
    if (!args.length || args.length > 2)
      throw new SyntaxError('Invalid number of arguments for ~= []')
    if (args[0].type !== 'word')
      throw new SyntaxError('First argument of ~= [] must be word')
    const name = args[0].name
    if (name.includes('.') || name.includes('-'))
      throw new SyntaxError(
        'Invalid use of operation ~= [] [variable name must not contain . or -]'
      )
    const value =
      args.length === 1 ? VOID : evaluate(args[args.length - 1], env)
    env[name] = value
    return value
  },
  ['^']: (args, env) => {
    if (args.length != 2)
      throw new SyntaxError('Invalid number of arguments for ^ []')
    const entity = evaluate(args[0], env)
    const callback = evaluate(args[1], env)
    if (typeof callback !== 'function')
      throw new TypeError('Second argument of ^ [] must be an -> []')
    return callback(entity)
  },
}

export { tokens }
