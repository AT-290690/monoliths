import { VOID } from '../core/tokens.js'
import Brrr from './Brrr.js'
export const protolessModule = (methods) => {
  const env = Object.create(null)
  for (const method in methods) env[method] = methods[method]
  return env
}

export const LIBRARY = {
  NAME: 'LIBRARY',
  HTTP: {
    NAME: 'HTTP',
    getrequestmanyjson: (callback, ...promises) =>
      Promise.all(promises).then((res) =>
        Promise.all(res.map((r) => r.json()).then(callback))
      ),
    getrequestsinglejson: (url, callback) =>
      fetch(url)
        .then((data) => data.json())
        .then(callback),
    getrequestsingletext: (url, callback) =>
      fetch(url)
        .then((data) => data.text())
        .then(callback),
  },
  STORAGE: {
    NAME: 'STORAGE',
    setinstorage: (key, value) => sessionStorage.setItem(key, value),
    getfromstorage: (key) => sessionStorage.getItem(key),
    removefromstorage: (key) => sessionStorage.removeItem(key),
    clearstorage: () => sessionStorage.clear(),
  },
  DATE: {
    NAME: 'DATE',
    formattolocal: (date, format) => date.toLocaleDateString(format),
    makenewdate: () => new Date(),
    makedate: (date) => new Date(date),
    gethours: (date) => date.getHours(),
    getminutes: (date) => date.getMinutes(),
    getseconds: (date) => date.getSeconds(),
    gettime: (date) => date.getTime(),
  },
  COLOR: {
    NAME: 'COLOR',
    makergbcolor: (r, g, b) => `rgb(${r}, ${g}, ${b})`,
    makergbalphacolor: (r, g, b, a = 1) => `rgba(${r}, ${g}, ${b}, ${a})`,
    randomcolor: () => `#${Math.floor(Math.random() * 16777215).toString(16)}`,
    randomlightcolor: () =>
      '#' +
      (
        '00000' + Math.floor(Math.random() * Math.pow(16, 6)).toString(16)
      ).slice(-6),
    rgbtohex: (color) => {
      const [r, g, b] = color.split('(')[1].split(')')[0].split(',').map(Number)
      function componentToHex(c) {
        var hex = c.toString(16)
        return hex.length == 1 ? '0' + hex : hex
      }
      return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b)
    },
    inverthexcolor: (hex) =>
      '#' +
      (Number(`0x1${hex.split('#')[1]}`) ^ 0xffffff)
        .toString(16)
        .substring(1)
        .toUpperCase(),
  },
  BITWISE: {
    NAME: 'BITWISE',
    and: (a, b) => a & b,
    not: (a) => ~a,
    or: (a, b) => a | b,
    xor: (a, b) => a ^ b,
    leftshift: (a, b) => a << b,
    rightshift: (a, b) => a >> b,
    unrightshift: (a, b) => a >>> b,
  },
  MATH: {
    NAME: 'MATH',
    lerp: (start, end, amt) => (1 - amt) * start + amt * end,
    abs: (num) => Math.abs(num),
    mod: (left, right) => ((left % right) + right) % right,
    clamp: (num, min, max) => Math.min(Math.max(num, min), max),
    sqrt: (num) => Math.sqrt(num),
    inc: (a, i = 1) => (a += i),
    add: (a, b) => a + b,
    sub: (a, b) => a - b,
    mult: (a, b) => a * b,
    pow: (a, b) => a ** b,
    pow2: (a) => a ** 2,
    divide: (a, b) => a / b,
    sign: (n) => Math.sign(n),
    trunc: (n) => Math.trunc(n),
    exp: (n) => Math.exp(n),
    floor: (n) => Math.floor(n),
    round: (n) => Math.round(n),
    random: () => Math.random(),
    randomint: (min, max) => Math.floor(Math.random() * (max - min + 1) + min),
    max: (...args) => Math.max(...args),
    min: (...args) => Math.min(...args),
    sin: (n) => Math.sin(n),
    cos: (n) => Math.cos(n),
    tan: (n) => Math.tan(n),
    tanh: (n) => Math.tanh(n),
    atan: (n) => Math.atan(n),
    atanh: (n) => Math.atanh(n),
    atan2: (y, x) => Math.atan2(y, x),
    acos: (n) => {
      n = Math.acos(n)
      return isNaN(n) ? VOID : n
    },
    acosh: (n) => {
      n = Math.acosh(n)
      return isNaN(n) ? VOID : n
    },
    asin: (n) => {
      n = Math.asin(n)
      return isNaN(n) ? VOID : n
    },
    asinh: (n) => Math.asinh(n),
    atanh: (n) => {
      n = Math.atanh(n)
      return isNaN(n) ? VOID : n
    },
    hypot: (x, y) => Math.hypot(x, y),
    fround: (n) => Math.fround(n),
    log10: (x) => Math.log10(x),
    log2: (x) => Math.log2(x),
    log: (x) => Math.log(x),
    sum: (arr) => arr.reduce((acc, item) => (acc += item), 0),
    MININT: Number.MIN_SAFE_INTEGER,
    MAXINT: Number.MAX_SAFE_INTEGER,
    infinity: Number.POSITIVE_INFINITY,
    negative: (n) => -n,
    PI: Math.PI,
    E: Math.E,
    LN10: Math.LN10,
    LOG10E: Math.LOG10E,
    SQRT1_2: Math.SQRT1_2,
    SQRT2: Math.SQRT2,
    parseint: (number, base) => parseInt(number.toString(), base),
    number: (string) => Number(string),
  },
  STRING: {
    NAME: 'STRING',
    fromcharcode: (code) => String.fromCharCode(code),
    interpolate: (...args) => {
      return args.reduce((acc, item) => {
        return (acc += item.toString())
      }, '')
    },
    includes: (string, target) => string.includes(target),
    string: (thing) => thing.toString(),
    uppercase: (string) => string.toUpperCase(),
    lowercase: (string) => string.toLowerCase(),
    trim: (string) => string.trim(),
    trimstart: (string) => string.trimStart(),
    trimend: (string) => string.trimEnd(),
    substring: (string, start, end) =>
      string.substring(start, end ?? end.length),
    replace: (string, match, replace) => string.replace(match, replace),
    replaceall: (string, match, replace) => string.replaceAll(match, replace),
    sp: ' ',
  },
  CONVERT: {
    NAME: 'CONVERT',
    array: (thing) => [...thing],
    boolean: (thing) => Boolean(thing),
    string: (thing) => thing.toString(),
    integer: (number) => parseInt(number.toString()),
    float: (number, base = 1) => +Number(number).toFixed(base),
    number: (thing) => Number(thing),
    cast: (value, type) => {
      if (type === '1')
        return typeof value === 'object'
          ? Object.keys(value).length
          : Number(value)
      else if (type === '')
        return typeof value === 'object' ? JSON.stringify(value) : String(value)
      else if (value === null || value === undefined) return VOID
      else if (type === '.:') {
        if (Brrr.isBrrr(value)) return value
        else if (typeof value === 'string') return [...value]
        else if (typeof value === 'number')
          return [...String(value)].map(Number)
        else if (typeof value === 'object') return Object.entries(value)
      } else if (type === '::') {
        if (typeof value === 'string' || Array.isArray(value))
          return { ...value }
        else if (typeof value === 'number') {
          const out = { ...String(value) }
          for (const key in out) {
            out[key] = Number(out[key])
          }
          return out
        } else if (typeof value === 'object') return value
      } else return VOID
    },
  },
  CONSOLE: {
    consolelog: (thing) => console.log(thing),
    NAME: 'CONSOLE',
  },
  LOGIC: {
    NAME: 'LOGIC',
    isstring: (string) => +(typeof string === 'string'),
    isnumber: (number) => +(typeof number === 'number'),
    isnotstring: (string) => +!(typeof string === 'string'),
    isnotnumber: (number) => +!(typeof number === 'number'),
    isnotarray: (array) => +!Array.isArray(array),
    isnotobject: (object) =>
      +!(typeof object === 'object' && !Array.isArray(array)),

    is: (a, b) => Object.is(a, b),
    istrue: (bol) => +(!!bol === true),
    isfalse: (bol) => +(!!bol === false),
    isequal: (a, b) => Brrr.isEqual(a, b),
    issimilar: (a, b) => {
      const typeA = typeof a,
        typeB = typeof b
      if (typeA !== typeB) return 0
      if (typeA === 'number' || typeA === 'string' || typeA === 'boolean') {
        return +(a === b)
      }
      if (typeA === 'object') {
        const isArrayA = Array.isArray(a),
          isArrayB = Array.isArray(b)
        if (isArrayA !== isArrayB) return 0
        if (isArrayA && isArrayB) {
          return a.length < b.length
            ? +a.every((item, index) => LIBRARY.LOGIC.issimilar(item, b[index]))
            : +b.every((item, index) => LIBRARY.LOGIC.issimilar(item, a[index]))
        } else {
          if (a === undefined || a === null || b === undefined || b === null)
            return +(a === b)
          const less = Object.keys(a) > Object.keys(b) ? b : a
          for (const key in less) {
            if (!LIBRARY.LOGIC.issimilar(a[key], b[key])) {
              return 0
            }
          }
          return 1
        }
      }
    },
    isnotvoid: (item) => (item === VOID ? 0 : 1),
    isvoid: (item) => (item === VOID ? 1 : 0),
    makeboolean: (item) => Boolean(item),
    and: (entity, other) => entity && other,
    or: (entity, other) => entity || other,
    isempty: (item) => (Object.keys(item).length === 0 ? 1 : 0),
    TRUE: 1,
    FALSE: 0,
    iseven: (arg) => (arg % 2 === 0 ? 1 : 0),
    isodd: (arg) => (arg % 2 !== 0 ? 1 : 0),
    invert: (val) => +!val,
    ishaving: (obj, ...props) => +props.every((x) => x in obj),
    areequal: (item, ...args) =>
      +args.every((current) => LIBRARY.LOGIC.isequal(item, current)),
    isoftype: (entity, type) =>
      entity.constructor.name.toUpperCase() === type.toUpperCase(),
  },
  LOOP: {
    NAME: 'LOOP',
    generator: (entity = [], index = 0) => {
      return function* () {
        while (true) {
          yield entity[index++]
        }
      }
    },
    counter: (index = 0) => {
      return function* () {
        while (true) {
          yield index++
        }
      }
    },
    next: (entity) => {
      return entity.next().value
    },
    iterate: (iterable, callback) => {
      for (const i in iterable) {
        callback(i, iterable)
      }
      return iterable
    },
    inside: (iterable, callback) => {
      for (const i in iterable) {
        callback(i)
      }
      return iterable
    },
    forofevery: (iterable, callback) => {
      for (const x of iterable) {
        callback(x)
      }
      return iterable
    },
    routine: (entity, times, callback) => {
      let out = VOID
      for (let i = 0; i < times; ++i) out = callback(entity, i)
      return out
    },
    loop: (start, end, callback) => {
      for (let i = start; i < end; ++i) callback(i)
    },
    whiletrue: (condition, callback) => {
      let out = VOID
      while (condition()) out = callback()
      return out
    },
    repeat: (times, callback) => {
      let out = VOID
      for (let i = 0; i < times; ++i) out = callback(i)
      return out
    },
    tailcalloptimisedrecursion:
      (func) =>
      (...args) => {
        let result = func(...args)
        while (typeof result === 'function') result = result()
        return result
      },
  },
  LIST: {
    reverse: (list) => {
      let head = list // set a reference to head of linked list
      if (head['=>'][0] === VOID) return

      let currentNode = head
      let prevNode = VOID
      let nextNode = VOID

      // traverse list and adjust links
      while (currentNode) {
        nextNode = currentNode['=>'][0]
        currentNode['=>'][0] = prevNode
        prevNode = currentNode
        currentNode = nextNode
        nextNode = VOID
      }
      head = prevNode
      return head
    },
  },
  DOUBLELIST: {
    NAME: 'DOUBLELIST',
    makedoublelist: (size) => LIBRARY.DOUBLELIST.range(0)(size),
    node: (prev) => (next) => ({ '<-': prev, '->': next }),
    prev: (n) => n['<-'],
    next: (n) => n['->'],
    range: (low) => (high) =>
      low > high
        ? VOID
        : LIBRARY.DOUBLELIST.node(low)(LIBRARY.DOUBLELIST.range(low + 1)(high)),
    map: (f) => (n) =>
      n === VOID
        ? VOID
        : LIBRARY.DOUBLELIST.node(f(LIBRARY.DOUBLELIST.prev(n)))(
            LIBRARY.DOUBLELIST.map(f)(LIBRARY.DOUBLELIST.next(n))
          ),
    listtoarray: (node) => {
      const result = []
      while (node !== VOID) {
        result.push(LIBRARY.DOUBLELIST.prev(node))
        node = LIBRARY.DOUBLELIST.next(node)
      }
      return result
    },
    arraytolist: (arrayLike) => {
      let result = VOID
      const array = Array.from(arrayLike)
      for (let i = array.length; i >= 0; i--) {
        result = LIBRARY.DOUBLELIST.node(array[i])(result)
      }
      return result
    },
  },
  ARRAY: {
    NAME: 'ARRAY',
    splitnewline: (str) => Brrr.from(str.split('\n')),
    splitspaces: (str) => Brrr.from(str.split(' ')),
    split: (str, separator) => Brrr.from(str.split(separator)),
    join: (entity, separator) => entity.join(separator),
    shuffle: (array) => {
      array = array.toArray()
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[array[i], array[j]] = [array[j], array[i]]
      }
      return Brrr.from(array)
    },
    zeroes: (size) => Brrr.zeroes(size),
    ones: (size) => Brrr.ones(size),
    range: (start, end, step = 1) => {
      const arr = new Brrr()
      if (start > end)
        for (let i = start; i >= end; i -= 1) arr.append(i * step)
      else for (let i = start; i <= end; i += 1) arr.append(i * step)
      return arr.balance()
    },
  },
  CANVAS: {
    NAME: 'CANVAS',
    quickcanvas: (w = 300, h = 300, border = 'none') => {
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      canvas.style.border = border
      const ctx = canvas.getContext('2d')
      document.body.appendChild(canvas)
      return ctx
    },
    clearrect: (ctx, x, y, width, height) => {
      ctx.clearRect(x, y, width, height)
      return ctx
    },
    drawimage: (
      ctx,
      image,
      sx,
      sy,
      sWidth,
      sHeight,
      dx,
      dy,
      dWidth,
      dHeight
    ) => {
      ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
      return ctx
    },
    setfillstyle: (ctx, color) => {
      ctx.fillStyle = color
      return ctx
    },
    makefilledrect: (ctx, x, y, w, h) => {
      ctx.fillRect(x, y, w, h)
      return ctx
    },
    setstrokestyle: (ctx, color) => {
      ctx.strokeStyle = color
      return ctx
    },
    setlinewidth: (ctx, width) => {
      ctx.lineWidth = width
      return ctx
    },
    makestroke: (ctx) => {
      ctx.stroke()
      return ctx
    },
    makepath: (ctx) => {
      ctx.beginPath()
      return ctx
    },
    moveto: (ctx, x, y) => {
      ctx.moveTo(x, y)
      return ctx
    },
    lineto: (ctx, x, y) => {
      ctx.lineTo(x, y)
      return ctx
    },
    arc: (ctx, x, y, radius, startAngle, endAngle, counterclockwise) => {
      ctx.arc(x, y, radius, startAngle, endAngle, counterclockwise)
      return ctx
    },
    fill: (ctx) => {
      ctx.fill()
      return ctx
    },
    stroke: (ctx) => {
      ctx.stroke()
      return ctx
    },
  },
  DOM: {
    NAME: 'DOM',
    appendchild: (parent, child) => {
      parent.appendChild(child)
      return parent
    },
    getbody: () => document.body,
    getparentnode: (element) => element.parentNode,
    makefragment: () => document.createDocumentFragment(),
    getelementbyid: (id) => document.getElementById(id),
    getelementsbyclassname: (tag) => document.getElementsByClassName(tag),
    getelementsbytagname: (tag) => document.getElementsByTagName(tag),
    makeuserinterface: () => {
      const div = document.createElement('div')
      document.body.appendChild(div)
      return div
    },
    makeimage: (src) => {
      const img = document.createElement('img')
      img.src = src
      return img
    },
    makeiframe: (src) => {
      const element = document.createElement('iframe')
      element.setAttribute('src', src)
      return element
    },
    makeelement: (type, settings) => {
      const element = document.createElement(type)
      for (const setting in settings) {
        element.setAttribute(setting, settings[setting])
      }
      return element
    },
    makecanvas: (settings) => {
      const element = document.createElement('canvas')
      for (const setting in settings) {
        element.setAttribute(setting, settings[setting])
      }
      return element
    },
    makeinput: (settings) => {
      const element = document.createElement('input')
      for (const setting in settings) {
        element.setAttribute(setting, settings[setting])
      }
      return element
    },
    maketextarea: (settings) => {
      const element = document.createElement('textarea')
      for (const setting in settings) {
        element.setAttribute(setting, settings[setting])
      }
      return element
    },
    makecheckbox: () => {
      const checkbox = document.createElement('input')
      checkbox.type = 'checkbox'
      return checkbox
    },
    makeslider: (settings) => {
      const element = document.createElement('input')
      element.type = 'range'

      for (const setting in settings) {
        element.setAttribute(setting, settings[setting])
      }
      return element
    },

    copyfromelement: (copyElement) => {
      copyElement.select()
      copyElement.setSelectionRange(0, 99999)
      navigator.clipboard.writeText(copyElement.value)
    },
    copyfromtext: (val) => {
      navigator.clipboard.writeText(val)
    },
    maketooltip: (defaultLabel) => {
      const tooltip = document.createElement('span')
      tooltip.textContent = defaultLabel
      return tooltip
    },
    maketable: (content) => {
      const table = document.createElement('table')
      table.innerHTML = content
      return table
    },
    maketablerow: (content) => {
      const table = document.createElement('tr')
      table.innerHTML = content
      return table
    },
    maketabledata: (content) => {
      const table = document.createElement('td')
      table.innerHTML = content
      return table
    },
    maketableheader: (content) => {
      const table = document.createElement('th')
      table.innerHTML = content
      return table
    },
    maketablecaption: (content) => {
      const table = document.createElement('caption')
      table.innerHTML = content
      return table
    },
    maketablecolumn: (content) => {
      const table = document.createElement('col')
      table.innerHTML = content
      return table
    },
    maketablecolumngroup: (content) => {
      const table = document.createElement('colgroup')
      table.innerHTML = content
      return table
    },
    maketablehead: (content) => {
      const table = document.createElement('thead')
      table.innerHTML = content
      return table
    },
    maketablebody: (content) => {
      const table = document.createElement('tbody')
      table.innerHTML = content
      return table
    },
    maketablefooter: (content) => {
      const table = document.createElement('tfoot')
      table.innerHTML = content
      return table
    },
    makebutton: () => {
      const element = document.createElement('button')
      return element
    },
    makelabel: (element, label) => {
      element.textContent = label
      return element
    },
    makeheader: (content, n = 1) => {
      const element = document.createElement('h' + n)
      element.textContent = content
      return element
    },
    makelist: (content) => {
      const element = document.createElement('li')
      element.appendChild(content)
      return element
    },
    makecsslink: (href) => {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = href
      link.crossorigin = 'anonymous'
      document.head.appendChild(link)
      return link
    },
    makeorderedlist: (...lists) => {
      const element = document.createElement('ol')
      lists.forEach((l) => element.appendChild(l))
      return element
    },
    makeunorderedlist: (...lists) => {
      const element = document.createElement('ul')
      lists.forEach((l) => element.appendChild(l))
      return element
    },
    makeanchor: (content, href) => {
      const element = document.createElement('a')
      element.href = href
      element.textContent = content
      return element
    },
    makepre: (content) => {
      const element = document.createElement('pre')
      element.textContent = content
      return element
    },
    makeparagraph: (content) => {
      const element = document.createElement('p')
      element.textContent = content
      return element
    },
    makespan: (content) => {
      const element = document.createElement('span')
      element.textContent = content
      return element
    },
    setid: (element, id) => {
      element.setAttribute('id', id)
      return element
    },
    maketablefrom: (tableData) => {
      const table = document.createElement('table')
      const tableBody = document.createElement('tbody')
      tableData.forEach((rowData) => {
        const row = document.createElement('tr')
        rowData.forEach((cellData) => {
          const cell = document.createElement('td')
          cell.appendChild(document.createTextNode(cellData))
          row.appendChild(cell)
        })
        tableBody.appendChild(row)
      })
      table.appendChild(tableBody)
      return table
    },
    getid: (element) => element.getAttribute('id'),
    getattribute: (element, key) => element.getAttribute(key),
    setattribute: (element, key, value) => {
      element.setAttribute(key, value)
      return element
    },
    settextcontent: (element, content) => {
      element.textContent = content
      return element
    },
    setstyle: (element, ...styles) => {
      element.style = styles.join('')
      return element
    },
    makecontainer: (...elements) => {
      const div = document.createElement('div')
      elements.forEach((element) => div.appendChild(element))
      document.body.appendChild(div)
      return div
    },
    makediv: (...elements) => {
      const div = document.createElement('div')
      elements.forEach((element) => div.appendChild(element))
      return div
    },
    makeitalictext: (content) => {
      const element = document.createElement('i')
      element.textContent = content
      return element
    },
    insertintocontainer: (container, ...elements) => {
      elements.forEach((element) => container.appendChild(element))
      return container
    },
    removeselffromcontainer: (...elements) =>
      elements.forEach((element) => element.parentNode.removeChild(element)),
  },
  STYLE: {
    NAME: 'STYLE',
    makestyle: (...styles) => {
      const element = document.createElement('style')
      element.innerHTML = styles.reduce((acc, [selector, ...style]) => {
        acc += `${selector}{${style.join(';')}}`
        return acc
      }, '')
      document.body.appendChild(element)
      return element
    },
    addclass: (element, ...classlist) => {
      classlist.forEach((cls) => element.classList.add(cls))
      return element
    },
    noborder: () => 'border: none;',
    borderradius: (value) => `border-radius: ${value};`,
    border: (options) =>
      `border: ${options.get('size') ?? ''} ${options.get('type') ?? ''} ${
        options.get('color') ?? ''
      };`.trim(),
    margin: (options) =>
      `margin: ${options.get('top') ?? '0'} ${options.get('right') ?? '0'} ${
        options.get('bottom') ?? '0'
      } ${options.get('left') ?? '0'};`,
    padding: (options) =>
      `padding: ${options.get('top') ?? '0'} ${options.get('right') ?? '0'} ${
        options.get('bottom') ?? '0'
      } ${options.get('left') ?? '0'};`,
    display: (display) =>
      `display: ${
        { f: 'flex', g: 'grid', i: 'inline', b: 'block', ib: 'inline-block' }[
          display
        ]
      };`,
    unitspercent: (value) => `${value}%`,
    unitspixel: (value) => `${value}px`,
    unitspoint: (value) => `${value}pt`,
    backgroundcolor: (color) => `background-color: ${color};`,
    resetcss: () => {
      const element = document.createElement('style')
      element.innerHTML = `html, body, div, span, applet, object, iframe,
   h1, h2, h3, h4, h5, h6, p, blockquote, pre,
   a, abbr, acronym, address, big, cite, code,
   del, dfn, em, img, ins, kbd, q, s, samp,
   small, strike, strong, sub, sup, tt, var,
   b, u, i, center,
   dl, dt, dd, ol, ul, li,
   fieldset, form, label, legend,
   table, caption, tbody, tfoot, thead, tr, th, td,
   article, aside, canvas, details, embed, 
   figure, figcaption, footer, header, hgroup, 
   menu, nav, output, ruby, section, summary,
   time, mark, audio, video {
     margin: 0;
     padding: 0;
     border: 0;
     font-size: 100%;
     font: inherit;
     vertical-align: baseline;
   }
   /* HTML5 display-role reset for older browsers */
   article, aside, details, figcaption, figure, 
   footer, header, hgroup, menu, nav, section {
     display: block;
   }
   body {
     line-height: 1;
   }
   ol, ul {
     list-style: none;
   }
   blockquote, q {
     quotes: none;
   }
   blockquote:before, blockquote:after,
   q:before, q:after {
     content: '';
     content: none;
   }
   table {
     border-collapse: collapse;
     border-spacing: 0;
   }
   a {
    color: blue;
    text-decoration: none; /* no underline */
  }
   `
      document.body.appendChild(element)
      return element
    },
    cursorpointer: () => 'cursor: pointer;',
    fontfamily: (font) => `font-family: ${font};`,
    fontsize: (size) => `font-size: ${size};`,
    displayshow: (element) => {
      element.style.display = 'block'
      return element
    },
    displayhide: (element) => {
      element.style.display = 'none'
      return element
    },
    textcolor: (color) => `color:${color};`,
    textalign: (align = 'c') =>
      `text-align:${{ c: 'center', l: 'left', r: 'right' }[align]};`,
    makeclass: (name, attr) => {
      let out = ''
      for (const a in attr) {
        out += `${a}: ${attr[a]};`
      }
      return `.${name} {\n${out}\n}`
    },
    makesvgstyle: (entity, props) => {
      for (const prop in props) {
        entity.renderer.elem.style[prop] = props[prop]
      }
      return entity.renderer.elem
    },
    styleoption: (attr) => {
      let out = ''
      for (const a in attr) out += `${a}: ${attr[a]};`
      return out
    },
  },
  TIME: {
    NAME: 'TIME',
    settimeout: (callback, time) => setTimeout(callback, time),
    setinterval: (callback, time = 1000) => setInterval(callback, time),
    setanimation: (callback) => requestAnimationFrame(callback),
  },
  EVENT: {
    NAME: 'EVENT',
    oninputchange: (element, callback) => {
      element.addEventListener('change', (e) => callback(e.target))
      return element
    },
    onmouseclick: (element, callback) => {
      element.addEventListener('click', (e) => callback(e.target))
      return element
    },
    onmouseover: (element, callback) => {
      element.addEventListener('mouseover', (e) => callback(e.target))
      return element
    },
    onkeydown: (element, callback) => {
      element.addEventListener('keydown', (e) => callback(e.key))
      return element
    },
    onkeyup: (element, callback) => {
      element.addEventListener('keyup', (e) => callback(e.key))
      return element
    },
  },
  void: VOID,
  VOID,
}

export const STD = {
  void: VOID,
  VOID,
  _: VOID,
  printout: (...args) => console.log(...args),
  // IMP: module => {
  //   console.log(
  //     `<- [${Object.keys(module)
  //       .filter(x => x !== 'NAME')
  //       .map(x => `"${x}"`)
  //       .join(';')}] [${module.NAME}];\n`
  //   )
  // },
  call: (x, callback) => callback(x),
  tco:
    (func) =>
    (...args) => {
      let result = func(...args)
      while (typeof result === 'function') result = result()
      return result
    },
  LIBRARY,
}
