// const filterAlphabetic = (text) => text.replace(/[^A-Z]/gi, ' ')
const monolith = document.getElementById('monolith')
const container = document.getElementById('container')

monolith.addEventListener('input', (e) => {
  const script = e.target.textContent.trim()
  const href = `https://at-290690.github.io/monoliths/public/chip/preview.html?s=${script}`
  container.src = href
})
