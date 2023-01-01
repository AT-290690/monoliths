import { decodeBase64 } from './language/misc/compression.js'
import { compileToJs } from './language/core/compiler.js'
import { treeShake, languageUtilsString, brrrHelpers } from './language/misc/utils.js'
import { wrapInBody, removeNoCode } from './language/misc/helpers.js'
import { parse } from './language/core/parser.js'
import Brrr from './language/extentions/Brrr.js'


const encoding = new URLSearchParams(location.search).get('s')
if (encoding) {
  const inlined = wrapInBody(
    removeNoCode(decodeBase64(decodeURIComponent(encoding)))
  )

  const { body, modules } = compileToJs(parse(inlined))
  console.log(body)
  const lib = treeShake(modules)
  const s = 
`${Brrr.toString()}
${brrrHelpers}
const VOID = null;
const LOGGER = () => () => {}
${languageUtilsString}
${lib}
;(() => { ${body} })()`
const script = document.createElement('script')

  script.innerHTML = s
  document.body.appendChild(script)
}

