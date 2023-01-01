import { fork } from 'child_process'
import { readFile } from 'fs/promises'
import { cpus } from 'os'
class ThreadPool {
  #counter = 0
  constructor(N) {
    this.pool = Array.from({ length: N }).map(() => this.spawn())
  }
  spawn() {
    const child = fork('./utils/sandbox.js')
    child.on('error', (error) => console.error(`Error: ${error.message}`))
    return child
  }
  send(message) {
    const index = (this.#counter = (this.#counter + 1) % this.pool.length)
    if (!this.pool[index].connected) {
      this.pool[index].kill()
      this.pool[index] = this.spawn()
    }
    this.pool[index].send(message)
  }
}

const forks = new ThreadPool(cpus().length)
const run = async (scriptPath, dir) => {
  const script = await readFile(scriptPath, 'utf-8')
  forks.send({
    script,
    dir,
  })
}
export { run }
