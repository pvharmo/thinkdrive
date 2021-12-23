export class Path {
  #path = ''
  #arrayPath: string[] = []
  #isFolder = false
  #isAbsolutePath = false
  #empty: boolean

  constructor(path: string) {
    this.#empty = !path || path.length === 0
    this.#path = path
    if (path[0] == '/') {
      this.#isAbsolutePath = true
      path = path.substr(1)
    }
    if (!this.#empty) {
      this.#isFolder = path[path.length - 1] === '/'
      this.#arrayPath = path.split('/')
      if (this.#isFolder) {
        this.#arrayPath.pop()
      }
    }
  }

  get isAbsolute() {
    return this.#isAbsolutePath
  }

  get isEmpty() {
    return this.#empty
  }

  get path() {
    return this.#path
  }

  get name() {
    return this.#arrayPath[this.#arrayPath.length - 1]
  }

  get isFolder() {
    return this.#isFolder
  }

  get asArray() {
    return this.#arrayPath
  }

  get parent() {
    return new Path(
      this.#arrayPath.slice(0, -1).join('/') + (this.#isFolder ? '/' : '')
    )
  }

  extractRoot(): [root: string, rest: Path] {
    const [root, ...rest] = this.#arrayPath
    return [root, new Path(rest.join('/'))]
  }
}
