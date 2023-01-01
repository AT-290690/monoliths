import { LIBRARY } from '../extensions/extentions.js'
const vars = new Set()
let modules = {}
const symbols = { ':': '/' }
const dfs = (tree, locals) => {
  if (!tree) return ''
  if (tree.type === 'apply') {
    switch (tree.operator.name) {
      case '..':
        return `(()=>{${tree.args
          .map((x, i) => {
            const res = dfs(x, locals)
            return res !== undefined && i === tree.args.length - 1
              ? ';return ' + res.toString().trimStart()
              : res
          })
          .join('')}})()`
      case ':=':
      case '~=': {
        const res = dfs(tree.args[1], locals)
        const name = tree.args[0].name
        locals.add(name)
        if (res !== undefined) return `((${name}=${res}),${name});`
        break
      }
      case '#': {
        const names = tree.args.map(({ name }) => {
          locals.add(name)
          return `${name} = "${name}"`
        })

        return `((${names.join(',')}),${tree.args[tree.args.length - 1].name});`
      }
      case '=': {
        const res = dfs(tree.args[1], locals)
        return `((${tree.args[0].name}=${res}),${tree.args[0].name});`
      }

      case '->': {
        const args = tree.args
        const body = args.pop()
        const localVars = new Set()
        const evaluatedBody = dfs(body, localVars)
        const vars = localVars.size ? `var ${[...localVars].join(',')};` : ''
        return `(${args.map((x) => dfs(x, locals))}) => {${vars} ${
          body.type === 'apply' || body.type === 'value' ? 'return ' : ' '
        } ${evaluatedBody.toString().trimStart()}};`
      }
      case '~':
        return '(' + tree.args.map((x) => dfs(x, locals)).join('+') + ')'
      case '==':
        return '(' + tree.args.map((x) => dfs(x, locals)).join('===') + ')'
      case '!=':
        return '(' + tree.args.map((x) => dfs(x, locals)).join('!==') + ')'
      case '+':
      case '-':
      case '*':
      case ':':
      case '>=':
      case '<=':
      case '>':
      case '<':
        return (
          '(' +
          tree.args
            .map((x) => dfs(x, locals))
            .join(symbols[tree.operator.name] ?? tree.operator.name) +
          ')'
        )
      case '??':
      case '&&':
      case '||':
        return (
          '(' +
          tree.args
            .map((x) => `(${dfs(x, locals)})`)
            .join(symbols[tree.operator.name] ?? tree.operator.name) +
          ')'
        )
      case '%':
        return (
          '(' +
          dfs(tree.args[0], locals) +
          '%' +
          dfs(tree.args[1], locals) +
          ')'
        )
      case '|':
        return `(${dfs(tree.args[0], locals)}.toFixed(
          ${tree.args.length === 1 ? 0 : dfs(tree.args[1], locals)}
        ))`
      case '!':
        return '!' + dfs(tree.args[0], locals)

      case '?': {
        const conditionStack = []
        tree.args
          .map((x) => dfs(x, locals))
          .forEach((x, i) =>
            i % 2 === 0
              ? conditionStack.push(x, '?')
              : conditionStack.push(x, ':')
          )
        conditionStack.pop()
        if (conditionStack.length === 3) conditionStack.push(':', 'null;')
        return `(${conditionStack.join('')});`
      }
      case '@':
        return `_repeat(${dfs(tree.args[0], locals)},${dfs(
          tree.args[1],
          locals
        )})`
      case '><>':
        return `_findLeft(${dfs(tree.args[0], locals)}, ${dfs(
          tree.args[1],
          locals
        )})`
      case '<><':
        return `_findRight(${dfs(tree.args[0], locals)}, ${dfs(
          tree.args[1],
          locals
        )})`
      case '|:|':
        return `_every(${dfs(tree.args[0], locals)}, ${dfs(
          tree.args[1],
          locals
        )})`
      case '|.|':
        return `_some(${dfs(tree.args[0], locals)}, ${dfs(
          tree.args[1],
          locals
        )})`
      case '.>':
        return `_at(${dfs(tree.args[0], locals)}, 0);`
      case '.<':
        return `_at(${dfs(tree.args[0], locals)}, -1);`
      case ':.':
        return `_at(${dfs(tree.args[0], locals)}, ${dfs(
          tree.args[1],
          locals
        )});`
      // case '</>':
      //   return `document.createElement(${dfs(tree.args[0], locals)})`
      case '.:':
        return 'Brrr.of(' + tree.args.map((x) => dfs(x, locals)).join(',') + ')'
      case '..:=':
        return `_set(${dfs(tree.args[0], locals)}, ${dfs(
          tree.args[1],
          locals
        )}, ${dfs(tree.args[2], locals)});`
      case '.:=':
        return `_append(${dfs(tree.args[0], locals)}, ${dfs(
          tree.args[1],
          locals
        )});`
      case '=.:':
        return `_prepend(${dfs(tree.args[0], locals)}, ${dfs(
          tree.args[1],
          locals
        )});`
      case '.:!=':
        return `_head(${dfs(tree.args[0], locals)});`
      case '!=.:':
        return `_tail(${dfs(tree.args[0], locals)});`
      case '|.':
        return `_cut(${dfs(tree.args[0], locals)});`
      case '.|':
        return `_chop(${dfs(tree.args[0], locals)});`
      case './:':
        return `_split(${dfs(tree.args[0], locals)}, ${
          tree.args[1] ? dfs(tree.args[1], locals) : '""'
        });`
      case '.:?':
        return `_length(${dfs(tree.args[0], locals)});`
      case '::':
        return (
          '{' +
          tree.args
            .map((x) => dfs(x, locals))
            .reduce((acc, item, index) => {
              if (index % 2 === 0) {
                const key = item.replace(';', '')
                acc +=
                  key[0] === '"' ? `"${key.replaceAll('"', '')}":` : `[${key}]:`
              } else acc += `${item},`
              return acc
            }, '') +
          '}'
        )
      case 'tco':
        return '_tco(' + dfs(tree.args[0], locals) + ');'
      case '...':
        return `_spreadArr([${tree.args
          .map((x) => dfs(x, locals))
          .join(',')}]);`
      case ':::':
        return `_spreadObj([${tree.args
          .map((x) => dfs(x, locals))
          .join(',')}]);`
      case '|>': {
        const [param, ...rest] = tree.args.map((x) => dfs(x, locals))
        return `_pipe(${rest.join(',')})(${param});`
      }
      case '~::': {
        return `_qSort(${dfs(tree.args[0], locals)}, ${dfs(
          tree.args[1],
          locals
        )});`
      }
      case '*::': {
        return `_mSort(${dfs(tree.args[0], locals)}, ${dfs(
          tree.args[1],
          locals
        )});`
      }
      case '.::': {
        return `_grp(${dfs(tree.args[0], locals)}, ${dfs(
          tree.args[1],
          locals
        )});`
      }
      case '.:@':
        return `_rot(${dfs(tree.args[0], locals)}, ${dfs(
          tree.args[1],
          locals
        )}, ${dfs(tree.args[2], locals)});`
      case '.:*':
        return `_slice(${dfs(tree.args[0], locals)}, ${dfs(
          tree.args[1],
          locals
        )}, ${dfs(tree.args[2], locals)});`
      case '_.':
        return `_flat(${dfs(tree.args[0], locals)}, ${dfs(
          tree.args[1],
          locals
        )});`
      case '>>':
        return `_scanLeft(${dfs(tree.args[0], locals)}, ${dfs(
          tree.args[1],
          locals
        )});`
      case '<<':
        return `_scanRight(${dfs(tree.args[0], locals)}, ${dfs(
          tree.args[1],
          locals
        )});`
      case '>>.':
        return `_mapLeft(${dfs(tree.args[0], locals)}, ${dfs(
          tree.args[1],
          locals
        )});`
      case '.<<':
        return `_mapRight(${dfs(tree.args[0], locals)}, ${dfs(
          tree.args[1],
          locals
        )});`
      case '>-':
        return `_filter(${dfs(tree.args[0], locals)}}, ${dfs(
          tree.args[1],
          locals
        )}});`
      case '>_': {
        const [array, callback, out] = tree.args.map((x) => dfs(x, locals))
        return `_reduceLeft(${array}, ${callback}, ${out});`
      }
      case '_<': {
        const [array, callback, out] = tree.args.map((x) => dfs(x, locals))
        return `_reduceRight(${array}, ${callback}, ${out});`
      }
      case '.': {
        const prop = []
        for (let i = 1; i < tree.args.length; ++i) {
          const arg = tree.args[i]
          prop.push(
            (arg.type === 'value'
              ? '"' + arg.value?.toString().trim().replaceAll('"', '') + '"'
              : dfs(arg, locals)) ?? null
          )
        }
        return `${dfs(tree.args[0], locals)}${prop
          .map((x) => '[' + x + ']')
          .join('')}`
      }
      case '.!=': {
        const prop = []
        for (let i = 1; i < tree.args.length; ++i) {
          const arg = tree.args[i]
          prop.push(
            (arg.type === 'value'
              ? '"' + arg.value?.toString().trim().replaceAll('"', '') + '"'
              : dfs(arg, locals)) ?? null
          )
        }
        const path = prop.map((x) => '[' + x + ']').join('')
        if (tree.args[0].type === 'apply') {
          locals.add('_tmp_')
          const obj = dfs(tree.args[0], locals)
          return `((delete (_tmp_=${obj})${path}), _tmp_);`
        } else {
          const obj = dfs(tree.args[0], locals)
          return `((delete ${obj}${path}), ${obj});`
        }
      }
      case '.=': {
        const res = dfs(tree.args[tree.args.length - 1], locals)
        const prop = []
        for (let i = 1; i < tree.args.length - 1; ++i) {
          const arg = tree.args[i]
          prop.push(
            (arg.type === 'value'
              ? '"' + arg.value?.toString().trim().replaceAll('"', '') + '"'
              : dfs(arg, locals)) ?? null
          )
        }
        const path = prop.map((x) => '[' + x + ']').join('')
        if (tree.args[0].type === 'apply') {
          locals.add('_tmp_')
          const obj = dfs(tree.args[0], locals)
          return `(((_tmp_=${obj})${path}=${res}), _tmp_);`
        } else {
          const obj = dfs(tree.args[0], locals)
          return `((${obj}${path}=${res}), ${obj});`
        }
      }
      default: {
        if (tree.operator.name)
          return (
            tree.operator.name +
            '(' +
            tree.args.map((x) => dfs(x, locals)).join(',') +
            ');'
          )
        else {
          if (tree.operator.operator.name === '<-') {
            const lib = tree.args[0]
            const imp =
              lib.type === 'word' ? lib.name : dfs(lib, locals).slice(0, -1)
            // const methods = tree.operator.args.map(x =>
            //   x.type === 'import' ? x.value : dfs(x, locals)
            // )
            const methods = tree.operator.args.map((x) => x.value)
            if (methods.includes('*')) {
              methods.length = 0
              const MOD = imp === 'LIBRARY' ? LIBRARY : LIBRARY[imp]
              return Object.keys(MOD).map((method) => {
                if (method !== 'NAME') {
                  locals.add(method)
                  if (imp in modules) modules[imp].push(method)
                  else modules[imp] = [method]
                }
                return `${method} = ${MOD.NAME}["${method}"];`
              })
            }

            return methods
              .map((method) => {
                if (method) {
                  locals.add(method)
                  if (imp in modules) modules[imp].push(method)
                  else modules[imp] = [method]
                }
                return `${method} = ${imp}["${method}"];`
              })
              .join('')
          } else if (
            tree.operator.operator.name === '.' &&
            tree.type === 'apply'
          ) {
            const [parent, method] = tree.operator.args
            const arg = tree.args.map((x) => dfs(x, locals))
            const caller = parent.name ? parent.name : dfs(parent, locals)
            return method.type === 'value'
              ? `${caller}["${method.value}"](${arg.join(',')});`
              : `${caller}[${dfs(method, locals)}](${arg.join(',')});`
          } else {
            return `(${dfs(tree.operator, locals)})(${tree.args
              .map((x) => dfs(x, locals))
              .join(',')})`
          }
        }
      }
    }
  } else if (tree.type === 'word')
    switch (tree.name) {
      case 'void':
      case 'VOID':
        return 'undefined'
      default:
        return tree.name
    }
  else if (tree.type === 'value')
    return tree.class === 'string' ? `"${tree.value}"` : tree.value
}

const semiColumnEdgeCases = new Set([
  ';)',
  ';-',
  ';+',
  ';*',
  ';%',
  ';&',
  ';/',
  ';:',
  ';.',
  ';=',
  ';<',
  ';>',
  ';|',
  ';,',
  ';?',
  ',,',
  ';;',
  ';]',
])
export const compileToJs = (AST) => {
  vars.clear()
  modules = {}
  const raw = dfs(AST, vars)
  let program = ''
  for (let i = 0; i < raw.length; ++i) {
    const current = raw[i]
    const next = raw[i + 1]
    if (!semiColumnEdgeCases.has(current + next)) program += current
  }
  const top = vars.size ? `var ${[...vars].join(',')};` : ''
  return { body: `${top}${program}`, modules }
}
