export class Path {
  #path = ''
  #splitPath: string[] = []
  #isFolder = false
  #empty: boolean

  constructor(path: string) {
    this.#empty = !path || path.length === 0
    this.#path = path
    if (!this.#empty) {
      this.#isFolder = path[path.length - 1] === '/'
      this.#splitPath = path.split('/')
      if (this.#isFolder) {
        this.#splitPath.pop()
      }
    }
  }

  get isEmpty() {
    return this.#empty
  }

  get path() {
    return this.#path
  }

  get name() {
    return this.#splitPath[this.#splitPath.length - 1]
  }

  get isFolder() {
    return this.#isFolder
  }
}
