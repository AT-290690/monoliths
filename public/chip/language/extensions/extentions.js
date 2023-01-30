import { VOID } from '../core/tokens.js'
import { LZUTF8 } from '../misc/lz-utf8.js'
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
    get_request_many_json: (callback, ...promises) =>
      Promise.all(promises).then((res) =>
        Promise.all(res.map((r) => r.json()).then(callback))
      ),
    get_request_many_text: (callback, ...promises) =>
      Promise.all(promises).then((res) =>
        Promise.all(res.map((r) => r.text()).then(callback))
      ),
    get_request_single_json: (url, callback) => {
      fetch(url)
        .then((data) => data.json())
        .then(callback)
    },
    get_request_single_text: (url, callback) => {
      fetch(url)
        .then((data) => data.text())
        .then(callback)
    },
  },
  STORAGE: {
    NAME: 'STORAGE',
    set_in_storage: (key, value) => sessionStorage.setItem(key, value),
    get_from_storage: (key) => sessionStorage.getItem(key),
    remove_from_storage: (key) => sessionStorage.removeItem(key),
    clear_storage: () => sessionStorage.clear(),
  },
  DATE: {
    NAME: 'DATE',
    format_to_local: (date, format) => date.toLocaleDateString(format),
    make_new_date: () => new Date(),
    make_date: (date) => new Date(date),
    get_hours: (date) => date.getHours(),
    get_minutes: (date) => date.getMinutes(),
    get_seconds: (date) => date.getSeconds(),
    get_time: (date) => date.getTime(),
  },
  COLOR: {
    NAME: 'COLOR',
    make_rgb_color: (r, g, b) => `rgb(${r}, ${g}, ${b})`,
    make_rgba_color: (r, g, b, a = 1) => `rgba(${r}, ${g}, ${b}, ${a})`,
    random_color: () => `#${Math.floor(Math.random() * 16777215).toString(16)}`,
    random_light_color: () =>
      '#' +
      (
        '00000' + Math.floor(Math.random() * Math.pow(16, 6)).toString(16)
      ).slice(-6),
    rgb_to_hex: (color) => {
      const [r, g, b] = color.split('(')[1].split(')')[0].split(',').map(Number)
      function componentToHex(c) {
        var hex = c.toString(16)
        return hex.length == 1 ? '0' + hex : hex
      }
      return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b)
    },
    invert_hex_color: (hex) =>
      '#' +
      (Number(`0x1${hex.split('#')[1]}`) ^ 0xffffff)
        .toString(16)
        .substring(1)
        .toUpperCase(),
  },
  BITWISE: {
    NAME: 'BITWISE',
    make_bit: (dec) => (dec >>> 0).toString(2),
    and: (a, b) => a & b,
    not: (a) => ~a,
    or: (a, b) => a | b,
    xor: (a, b) => a ^ b,
    left_shift: (a, b) => a << b,
    right_shift: (a, b) => a >> b,
    un_right_shift: (a, b) => a >>> b,
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
    random_int: (min, max) => Math.floor(Math.random() * (max - min + 1) + min),
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
    parse_int: (number, base) => parseInt(number.toString(), base),
    number: (string) => Number(string),
  },
  STRING: {
    NAME: 'STRING',
    lzutf8_compress: (string) =>
      LZUTF8.compress(string, { outputEncoding: 'StorageBinaryString' }),
    lzutf8_decompress: (source) =>
      LZUTF8.decompress(source.trim(), {
        inputEncoding: 'StorageBinaryString',
        outputEncoding: 'String',
      }),
    to_capital_case: (string) => string[0].toUpperCase() + string.substring(1),
    from_char_code: (code) => String.fromCharCode(code),
    interpolate: (...args) => {
      return args.reduce((acc, item) => {
        return (acc += item.toString())
      }, '')
    },
    includes: (string, target) => string.includes(target),
    string: (thing) => thing.toString(),
    upper_case: (string) => string.toUpperCase(),
    lower_case: (string) => string.toLowerCase(),
    trim: (string) => string.trim(),
    trim_start: (string) => string.trimStart(),
    trim_end: (string) => string.trimEnd(),
    substring: (string, start, end) =>
      string.substring(start, end ?? end.length),
    replace: (string, match, replace) => string.replace(match, replace),
    replace_all: (string, match, replace) => string.replaceAll(match, replace),
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
    console_log: (thing) => console.log(thing),
    NAME: 'CONSOLE',
  },
  LOGIC: {
    NAME: 'LOGIC',
    is_string: (string) => +(typeof string === 'string'),
    is_number: (number) => +(typeof number === 'number'),
    is_not_string: (string) => +!(typeof string === 'string'),
    is_not_number: (number) => +!(typeof number === 'number'),
    is_not_array: (array) => +!Brrr.isBrrr(array),
    is_array: (array) => +Brrr.isBrrr(array),
    is_map: (map) => +(map instanceof Map),
    is_not_map: (map) => +!(map instanceof Map),
    is_true: (bol) => +(!!bol === true),
    is_false: (bol) => +(!!bol === false),
    is_equal: (a, b) => +Brrr.of(a).isEqual(Brrr.of(b)),
  },
  LOOP: {
    NAME: 'LOOP',
    for_of: (iterable, callback) => {
      for (const [, value] of iterable) {
        callback(value, iterable)
      }
      return iterable
    },
    iterate: (iterable, callback) => {
      for (const [key, value] of iterable) {
        callback(key, value, iterable)
      }
      return iterable
    },
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

    for_of_every: (iterable, callback) => {
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
    while_true: (condition, callback) => {
      let out = VOID
      while (condition()) out = callback()
      return out
    },
    repeat: (times, callback) => {
      let out = VOID
      for (let i = 0; i < times; ++i) out = callback(i)
      return out
    },
    tail_call_optimised_recursion:
      (func) =>
      (...args) => {
        let result = func(...args)
        while (typeof result === 'function') result = result()
        return result
      },
  },
  ARRAY: {
    NAME: 'ARRAY',
    from: (arr) => Brrr.from(arr),
    split_new_line: (str) => Brrr.from(str.split('\n')),
    split_spaces: (str) => Brrr.from(str.split(' ')),
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
  DOM: {
    NAME: 'DOM',
    append_child: (parent, child) => {
      parent.appendChild(child)
      return parent
    },
    get_body: () => document.body,
    get_parent_node: (element) => element.parentNode,
    make_fragment: () => document.createDocumentFragment(),
    get_element_by_id: (id) => document.getElementById(id),
    get_elements_by_class_name: (tag) => document.getElementsByClassName(tag),
    get_elements_by_tag_name: (tag) => document.getElementsByTagName(tag),
    make_user_interface: () => {
      const div = document.createElement('div')
      document.body.appendChild(div)
      return div
    },
    make_image: (src) => {
      const img = document.createElement('img')
      img.src = src
      return img
    },
    make_iframe: (src) => {
      const element = document.createElement('iframe')
      element.setAttribute('src', src)
      return element
    },
    make_element: (type, settings) => {
      const element = document.createElement(type)
      for (const [key, value] of settings) {
        element.setAttribute(key, value)
      }
      return element
    },
    make_canvas: (settings) => {
      const element = document.createElement('canvas')
      for (const [key, value] of settings) {
        element.setAttribute(key, value)
      }
      return element
    },
    make_input: (settings) => {
      const element = document.createElement('input')
      for (const [key, value] of settings) {
        element.setAttribute(key, value)
      }
      return element
    },
    make_text_area: (settings) => {
      const element = document.createElement('textarea')
      for (const [key, value] of settings) {
        element.setAttribute(key, value)
      }
      return element
    },
    make_checkbox: () => {
      const checkbox = document.createElement('input')
      checkbox.type = 'checkbox'
      return checkbox
    },
    make_slider: (settings) => {
      const element = document.createElement('input')
      element.type = 'range'

      for (const [key, value] of settings) {
        element.setAttribute(key, value)
      }
      return element
    },

    copy_from_element: (copyElement) => {
      copyElement.select()
      copyElement.setSelectionRange(0, 99999)
      navigator.clipboard.writeText(copyElement.value)
    },
    copy_from_text: (val) => {
      navigator.clipboard.writeText(val)
    },
    make_tooltip: (defaultLabel) => {
      const tooltip = document.createElement('span')
      tooltip.textContent = defaultLabel
      return tooltip
    },
    make_table: () => {
      const table = document.createElement('table')
      return table
    },
    make_table_row: () => {
      const table = document.createElement('tr')
      return table
    },
    make_table_data: () => {
      const table = document.createElement('td')
      return table
    },
    make_table_header: () => {
      const table = document.createElement('th')
      return table
    },
    make_table_caption: () => {
      const table = document.createElement('caption')
      return table
    },
    make_table_column: () => {
      const table = document.createElement('col')
      return table
    },
    make_table_column_group: () => {
      const table = document.createElement('colgroup')
      return table
    },
    make_table_head: () => {
      const table = document.createElement('thead')
      return table
    },
    make_table_body: () => {
      const table = document.createElement('tbody')
      return table
    },
    make_table_footer: () => {
      const table = document.createElement('tfoot')
      return table
    },
    make_button: () => {
      const element = document.createElement('button')
      return element
    },
    add_text_content: (element, label) => {
      element.textContent = label
      return element
    },
    make_label: (...elements) => {
      const element = document.createElement('label')
      const frag = document.createDocumentFragment()
      elements.forEach((el) => frag.appendChild(el))
      element.appendChild(frag)
      return element
    },
    make_time: (format) => {
      const element = document.createElement('time')
      element.setAttribute('datetime', format)
      return element
    },
    make_aside: (...elements) => {
      const element = document.createElement('aside')
      const frag = document.createDocumentFragment()
      elements.forEach((el) => frag.appendChild(el))
      element.appendChild(frag)
      return element
    },
    make_header: (n = 1) => {
      const element = document.createElement('h' + n)
      return element
    },
    make_list: (content) => {
      const element = document.createElement('li')
      element.appendChild(content)
      return element
    },
    make_css_link: (href) => {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = href
      link.crossorigin = 'anonymous'
      document.head.appendChild(link)
      return link
    },
    load_bulma: (v1, v2, v3) => {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = `https://cdn.jsdelivr.net/npm/bulma@${v1}.${v2}.${v3}/css/bulma.min.css`
      link.crossorigin = 'anonymous'
      document.head.appendChild(link)
      return link
    },
    make_ordered_list: (...lists) => {
      const frag = document.createDocumentFragment()
      const element = document.createElement('ol')
      lists.forEach((l) => frag.appendChild(l))
      element.appendChild(frag)
      return element
    },
    make_unordered_list: (...lists) => {
      const element = document.createElement('ul')
      const frag = document.createDocumentFragment()
      lists.forEach((l) => frag.appendChild(l))
      element.appendChild(frag)
      return element
    },
    make_figure: (...elements) => {
      const element = document.createElement('figure')
      const frag = document.createDocumentFragment()
      elements.forEach((element) => frag.appendChild(element))
      element.appendChild(frag)
      return element
    },
    make_article: (...elements) => {
      const element = document.createElement('article')
      const frag = document.createDocumentFragment()
      elements.forEach((element) => frag.appendChild(element))
      element.appendChild(frag)
      return element
    },
    make_anchor: (href) => {
      const element = document.createElement('a')
      element.href = href
      return element
    },
    make_pre: () => {
      const element = document.createElement('pre')
      return element
    },
    make_nav: (inner) => {
      const element = document.createElement('nav')
      element.appendChild(inner)
      return element
    },
    make_paragraph: () => {
      const element = document.createElement('p')
      return element
    },
    make_span: () => {
      const element = document.createElement('span')
      return element
    },
    set_id: (element, id) => {
      element.setAttribute('id', id)
      return element
    },
    make_table_from: (tableData) => {
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
    get_id: (element) => element.getAttribute('id'),
    get_attribute: (element, key) => element.getAttribute(key),
    set_attribute: (element, key, value) => {
      element.setAttribute(key, value)
      return element
    },
    set_text_content: (element, content) => {
      element.textContent = content
      return element
    },
    set_style: (element, ...styles) => {
      element.style = styles.join('')
      return element
    },
    make_video: (src) => {
      const element = document.createElement('video')
      element.setAttribute('src', src)
      return element
    },
    make_progress: (value, max) => {
      const element = document.createElement('progress')
      element.setAttribute('value', value)
      element.setAttribute('max', max)
      return element
    },
    make_indeterminate_progress: (max) => {
      const element = document.createElement('progress')
      element.setAttribute('max', max)
      return element
    },
    make_container: (...elements) => {
      const frag = document.createDocumentFragment()
      const div = document.createElement('div')
      elements.forEach((element) => frag.appendChild(element))
      div.appendChild(frag)
      document.body.appendChild(div)
      return div
    },
    make_div: (...elements) => {
      const frag = document.createDocumentFragment()
      const div = document.createElement('div')
      elements.forEach((element) => frag.appendChild(element))
      div.appendChild(frag)
      return div
    },
    make_italic_text: () => {
      const element = document.createElement('i')
      return element
    },
    make_strong_text: () => {
      const element = document.createElement('strong')
      return element
    },
    insert_into_container: (container, ...elements) => {
      const frag = document.createDocumentFragment()
      elements.forEach((element) => frag.appendChild(element))
      container.appendChild(frag)
      return container
    },
    remove_self_from_container: (...elements) =>
      elements.forEach((element) => element.parentNode.removeChild(element)),
  },
  STYLE: {
    NAME: 'STYLE',
    make_style: (...styles) => {
      const element = document.createElement('style')
      element.innerHTML = styles.reduce((acc, [selector, ...style]) => {
        acc += `${selector}{${style.join(';')}}`
        return acc
      }, '')
      document.body.appendChild(element)
      return element
    },
    add_class: (element, ...classlist) => {
      classlist.forEach((cls) => element.classList.add(cls))
      return element
    },
    no_border: () => 'border: none;',
    border_radius: (value) => `border-radius: ${value};`,
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
    units_percent: (value) => `${value}%`,
    units_pixel: (value) => `${value}px`,
    units_point: (value) => `${value}pt`,
    background_color: (color) => `background-color: ${color};`,
    cursor_pointer: () => 'cursor: pointer;',
    font_family: (font) => `font-family: ${font};`,
    font_size: (size) => `font-size: ${size};`,
    display_show: (element) => {
      element.style.display = 'block'
      return element
    },
    display_hide: (element) => {
      element.style.display = 'none'
      return element
    },
    text_color: (color) => `color:${color};`,
    text_align: (align = 'c') =>
      `text-align:${{ c: 'center', l: 'left', r: 'right' }[align]};`,
    make_class: (name, attr) => {
      let out = ''
      for (const a in attr) {
        out += `${a}: ${attr[a]};`
      }
      return `.${name} {\n${out}\n}`
    },
    make_svg_style: (entity, props) => {
      for (const prop in props) {
        entity.renderer.elem.style[prop] = props[prop]
      }
      return entity.renderer.elem
    },
    style_option: (attr) => {
      let out = ''
      for (const a in attr) out += `${a}: ${attr[a]};`
      return out
    },
  },
  TIME: {
    NAME: 'TIME',
    set_timeout: (callback, time) => setTimeout(callback, time),
    set_interval: (callback, time = 1000) => setInterval(callback, time),
    set_animation: (callback) => requestAnimationFrame(callback),
  },
  EVENT: {
    NAME: 'EVENT',
    on_input_change: (element, callback) => {
      element.addEventListener('change', (e) => callback(e.target))
      return element
    },
    on_mouse_click: (element, callback) => {
      element.addEventListener('click', (e) => callback(e.target))
      return element
    },
    on_mouse_over: (element, callback) => {
      element.addEventListener('mouseover', (e) => callback(e.target))
      return element
    },
    on_key_down: (element, callback) => {
      element.addEventListener('keydown', (e) => callback(e.key))
      return element
    },
    on_key_up: (element, callback) => {
      element.addEventListener('keyup', (e) => callback(e.key))
      return element
    },
  },

  SKETCH: {
    NAME: 'SKETCH',
    UTILS: {
      NAME: 'UTILS',
      CANVAS: () => Two.Types.canvas,
      SVG: () => Two.Types.svg,
      WEBGL: () => Two.Types.webgl,
      make_grid: (size = 30, linewidth = 1, color = '#6b84b0') => {
        const two = new Two({
          type: Two.Types.canvas,
          width: LIBRARY.SKETCH.engine.width,
          height: LIBRARY.SKETCH.engine.height,
        })
        const a = two.makeLine(two.width / 2, 0, two.width / 2, two.height)
        const b = two.makeLine(0, two.height / 2, two.width, two.height / 2)
        a.stroke = b.stroke = color
        a.linewidth = b.linewidth = linewidth
        two.update()

        const imageData = two.renderer.domElement.toDataURL('image/png')
        LIBRARY.SKETCH.CANVAS_CONTAINER.firstChild.style.backgroundImage = `url(${imageData})`
        LIBRARY.SKETCH.CANVAS_CONTAINER.firstChild.style.backgroundSize = `${size}px`
      },
    },

    COMMANDS: {
      NAME: 'COMMANDS',
      MOVE: () => Two.Commands.move,
      CURVE: () => Two.Commands.curve,
      LINE: () => Two.Commands.line,
    },
    ANCHOR: {
      NAME: 'ANCHOR',
      anchor: (p1, p2, p3, p4, p5, p6, p7) =>
        new Two.Anchor(p1, p2, p3, p4, p5, p6, p7),
    },
    // MATRIX: {
    //   NAME: 'MATRIX',
    //   make_matrix: (a, b, c, d, e, f, g, h, i) =>
    //     new Two.Matrix(a, b, c, d, e, f, g, h, i),
    //   get_identity: (matrix) => Two.Matrix.Identity(matrix),
    //   multiply: (matrix, b, c) => Two.Matrix.multiply(matrix, b, c),
    //   get_elements: (matrix) => matrix.elements,
    // },
    PATH: {
      NAME: 'PATH',
      path_from: (points) => {
        const path = LIBRARY.SKETCH.engine.makePath(...points)
        path.closed = false
        return path
      },
      make_path: (...points) => {
        const path = LIBRARY.SKETCH.engine.makePath(...points)
        path.closed = false
        return path
      },
      path: (anchors, a, b, c) => new Two.Path(anchors.items, a, b, c),
    },
    VECTOR: {
      NAME: 'VECTOR',
      make_vector: (...args) => new Two.Vector(...args),
      ZERO: () => Two.Vector.zero,
      LEFT: () => Two.Vector.left,
      RIGHT: () => Two.Vector.right,
      UP: () => Two.Vector.up,
      DOWN: () => Two.Vector.down,
      add: (a, b) => Two.Vector.add(a, b),
      sub_tract: (a, b) => Two.Vector.subtract(a, b),
      multiply: (a, b) => Two.Vector.add(a, b),
      divide: (a, b) => a.divide(b),
      dot: (a, b) => a.dot(b),
      normalize: (vec) => vec.normalize(),
      ratio_between: (a, b) => Two.Vector.ratioBetween(a, b),
      angle_between: (a, b) => Two.Vector.angleBetween(a, b),
      distance_between: (a, b) => Two.Vector.distanceBetween(a, b),
      distance_between_squared: (a, b) =>
        Two.Vector.distanceBetweenSquared(a, b),
      distance_to: (a, b, e) => a.distanceTo(b, e),
      distance_to_squared: (a, b, e) => a.distanceToSquared(b, e),
      get_x: (vec) => vec.x,
      get_y: (vec) => vec.y,
      copy: (vec, d) => vec.copy(d),
      clear: (vec) => vec.clear(),
      clone: (vec) => vec.clone(),
      lerp: (vec, d, t) => vec.lerp(d, t),
      add_self: (vec, a) => vec.addSelf(a),
      subtract_self: (vec, a) => vec.subtractSelf(a),
      multiply_self: (vec, a) => vec.multiplySelf(a),
      multiply_scalar: (vec, scalar) => vec.multiplyScalar(scalar),
      divide_scalar: (vec, scalar) => vec.divideScalar(scalar),
      set_length: (vec, len) => vec.setLength(len),
      length: (vec) => vec.length(),
      rotate: (vec, angle) => vec.rotate(angle),
    },
    background: (color = 'var(--background-primary)') =>
      (LIBRARY.SKETCH.CANVAS_CONTAINER.firstChild.style.background = color),
    request_animation_frame: (fn) => (animation = requestAnimationFrame(fn)),
    destroy_composition: () => {
      LIBRARY.SKETCH.CANVAS_CONTAINER.style.background =
        'var(--background-primary)'
      LIBRARY.SKETCH.CANVAS_CONTAINER.innerHTML = ''
      LIBRARY.SKETCH.engine?.removeEventListener('update')
    },

    make_scene: (width = 100, height = 100, callback, type) => {
      LIBRARY.SKETCH.engine?.removeEventListener('update')
      let container = document.getElementById('canvas-container')
      if (!container) {
        container = document.createElement('div')
        container.setAttribute('id', 'canvas-container')
        document.body.appendChild(container)
      }
      LIBRARY.SKETCH.CANVAS_CONTAINER = container
      LIBRARY.SKETCH.engine = new Two({
        type,
        width,
        height,
        autostart: true,
      }).appendTo(LIBRARY.SKETCH.CANVAS_CONTAINER)
      callback()
      return 'Scene created!'
    },
    insert_into_group: (group, ...items) => {
      group.add(...items)
      return group
    },
    insert_into_group_by_partitions: (group, ...partitions) => {
      partitions.forEach((items) => group.add(...items))
      return group
    },
    remove_from_group: (item) => {
      item.parent.remove(item)
      LIBRARY.SKETCH.engine.add(item)
      return item
    },
    remove_from_scene: (item) => {
      item.remove()
      return VOID
    },
    group_additions: (group) => group.additions,
    group_children: (group) => group.children,
    width: (ratio = 1) => LIBRARY.SKETCH.engine.width * ratio,
    height: (ratio = 1) => LIBRARY.SKETCH.engine.height * ratio,
    insert_into_to_scene: (...elements) =>
      LIBRARY.SKETCH.engine.add(...elements),
    clear: () => LIBRARY.SKETCH.engine.clear(),
    ignore: (...args) => LIBRARY.SKETCH.engine.ignore(...args),
    interpret: (index) =>
      LIBRARY.SKETCH.engine.interpret(document.getElementById(index)),
    listen: (...args) => LIBRARY.SKETCH.engine.listen(...args),
    load: (...args) => LIBRARY.SKETCH.engine.load(...args),
    make_arc_segment: (
      x,
      y,
      innerRadius,
      outerRadius,
      startAngle,
      endAngle,
      resolution
    ) =>
      LIBRARY.SKETCH.engine.makeArcSegment(
        x,
        y,
        innerRadius,
        outerRadius,
        startAngle,
        endAngle,
        resolution
      ),
    make_arrow: (x1, y1, x2, y2) =>
      LIBRARY.SKETCH.engine.makeArrow(x1, y1, x2, y2),
    make_circle: (x, y, r) => LIBRARY.SKETCH.engine.makeCircle(x, y, r),
    make_curve: (...points) => LIBRARY.SKETCH.engine.makeCurve(...points),
    make_ellipse: (x, y, rx, ry, resolution) =>
      LIBRARY.SKETCH.engine.makeEllipse(x, y, rx, ry, resolution),
    make_group: (...args) => LIBRARY.SKETCH.engine.makeGroup(...args),
    make_image_sequence: (...args) =>
      LIBRARY.SKETCH.engine.makeImageSequence(...args),
    make_line: (x1, y1, x2, y2, color = 'white') => {
      const line = LIBRARY.SKETCH.engine.makeLine(x1, y1, x2, y2)
      line.stroke = color
      return line
    },
    make_linear_gradient: (...args) =>
      LIBRARY.SKETCH.engine.makeLinearGradient(...args),
    make_path: (...args) => LIBRARY.SKETCH.engine.makePath(...args),
    make_points: (...args) => LIBRARY.SKETCH.engine.makePoints(...args),
    make_polygon: (x, y, radius, sides) =>
      LIBRARY.SKETCH.engine.makePolygon(x, y, radius, sides),
    make_radial_gradient: (...args) =>
      LIBRARY.SKETCH.engine.makeRadialGradient(...args),
    make_rectangle: (x, y, w, h) =>
      LIBRARY.SKETCH.engine.makeRectangle(x, y, w, h),
    make_rounded_rectangle: (...args) =>
      LIBRARY.SKETCH.engine.makeRoundedRectangle(...args),
    make_sprite: (src, x, y, columns, rows, frameRate, autostart = true) =>
      LIBRARY.SKETCH.engine.makeSprite(
        src,
        x,
        y,
        columns,
        rows,
        frameRate,
        autostart
      ),
    make_star: (x, y, outerRadius, innerRadius, sides) =>
      LIBRARY.SKETCH.engine.makeStar(x, y, outerRadius, innerRadius, sides),
    make_text: (x, y, styles) => LIBRARY.SKETCH.engine.makeText(x, y, styles),
    make_texture: (src, callback) =>
      LIBRARY.SKETCH.engine.makeTexture(src, callback),
    on: (...args) => LIBRARY.SKETCH.engine.on(...args),
    off: (...args) => LIBRARY.SKETCH.engine.off(...args),
    pause: (...args) => {
      LIBRARY.SKETCH.engine.pause(...args)
      return 'Paused!'
    },
    play: (...args) => {
      LIBRARY.SKETCH.engine.play(...args)
      return 'Playing!'
    },
    sprite_play: (sprite, firstFrame, lastFrame, onLastFrame) => {
      sprite.play(firstFrame, lastFrame, onLastFrame)
      return sprite
    },
    sprite_stop: (sprite) => {
      sprite.stop()
      return sprite
    },
    sprite_pause: (sprite) => {
      sprite.pause()
      return sprite
    },
    release: (...args) => LIBRARY.SKETCH.engine.release(...args),
    remove: (...args) => LIBRARY.SKETCH.engine.remove(...args),
    set_playing: (...args) => LIBRARY.SKETCH.engine.setPlaying(...args),
    trigger: (...args) => LIBRARY.SKETCH.engine.trigger(...args),
    update: (...args) => {
      LIBRARY.SKETCH.engine.update(...args)
      return 'Updated!'
    },
    no_fill: (entity) => {
      entity.noFill()
      return entity
    },
    no_stroke: (entity) => {
      entity.noStroke()
      return entity
    },
    draw: (lifespan, callback) => {
      if (callback && typeof callback === 'function') {
        LIBRARY.SKETCH.engine.bind('update', callback)
        setTimeout(() => {
          LIBRARY.SKETCH.engine.unbind('update', callback)
          LIBRARY.SKETCH.engine.removeEventListener('update')
        }, 1000 * lifespan)
      }
    },

    set_screen_size: (w, h, showBorder = true) => {
      const svg = LIBRARY.SKETCH.CANVAS_CONTAINER.firstChild
      svg.setAttribute('width', w)
      svg.setAttribute('height', h)
      if (showBorder) svg.style.border = '1px solid lime'
    },
    set_offset_start: (entity) => {
      entity.position.x = entity.position.x + entity.width * 0.5
      entity.position.y = entity.position.y + entity.height * 0.5
      return entity
    },
    set_fill: (entity, fill) => {
      entity.fill = fill
      return entity
    },
    set_stroke: (entity, stroke) => {
      entity.stroke = stroke
      return entity
    },
    set_dashes: (entity, dashes) => {
      entity.dashes = dashes
      return entity
    },
    set_line_width: (entity, linewidth) => {
      entity.linewidth = linewidth
      return entity
    },
    offset_by: (entity, x, y) => {
      entity.additions
        ? entity.additions.forEach((item) => {
            item.position.set(item.position.x - x, item.position.y - y)
          })
        : entity.origin.set(x, y)

      entity.position.set(x, y)
      return entity
    },
    set_position: (entity, x, y) => {
      entity.position.set(x, y)
      return entity
    },
    set_position_x: (entity, x) => {
      entity.position.x = x
      return entity
    },
    set_position_y: (entity, y) => {
      entity.position.y = y
      return entity
    },
    set_scale: (entity, s) => {
      entity.scale = s
      return entity
    },
    set_opacity: (entity, opacity) => {
      entity.opacity = opacity
      return entity
    },
    set_rotation: (entity, a) => {
      entity.rotation = a
      return entity
    },
    set_width: (entity, w) => {
      entity.width = w
      return entity
    },
    set_height: (entity, h) => {
      entity.height = h
      return entity
    },
    set_origin: (entity, x, y) => {
      entity.additions
        ? entity.additions.forEach((item) => {
            item.position.set(item.position.x - x, item.position.y - y)
          })
        : entity.origin.set(x, y)
      return entity
    },
    close_path: (path) => {
      path.closed = true
      return path
    },
    make: (prop, ...args) => new Two[prop](...args),
    get_width: () => document.body.getBoundingClientRect().width,
    get_height: () => document.body.getBoundingClientRect().height,
    get_from_group: (group, index) => group.additions[index],
    get_origin: (entity) => entity.origin,
    get_opacity: (entity) => entity.opacity,
    get_dashes: (entity) => entity.dashes,
    get_position: (entity) => entity.position,
    get_rotation: (entity) => entity.rotation,
    get_scale: (entity) => entity.scale,
    get_translation: (entity) => entity.translation,
    get_bounds: (entity) => entity.getBoundingClientRect(),
  },
}

export const STD = {
  void: VOID,
  VOID,
  _: VOID,
  print_out: (...args) => console.log(...args),
  // IMP: module => {
  //   console.log(
  //     `<- [${Object.keys(module)
  //       .filter(x => x !== 'NAME')
  //       .map(x => `"${x}"`)
  //       .join(';')}] [${module.NAME}];\n`
  //   )
  // },
  tco:
    (func) =>
    (...args) => {
      let result = func(...args)
      while (typeof result === 'function') result = result()
      return result
    },
  LIBRARY,
}
