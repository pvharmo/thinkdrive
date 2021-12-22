import { Path } from '../../path'
import { findConnection } from '../../connections/interfaces'

import * as file from './file.controller'
import * as folder from './file.controller'

export interface PresignedUrl extends String {}

export interface Metadata {
  size: number
  etag: string
  lastModified: Date
}

export interface Child {
  name: string,
  type: string,
  contentUrl: string
}

export interface Obj {
  presignedUrl: PresignedUrl
}

export interface FileSystemAPI {
  readonly get: (path: Path) => Promise<Obj>
  readonly upload: (path: Path) => Promise<Obj>
  readonly destroy: (path: Path) => Promise<void>
  readonly move: (oldPath: Path, newPath: Path) => Promise<void>
  readonly getContainerContent: (path: Path) => Promise<Child[]>
  readonly saveContainer: (path: Path) => Promise<void>
  readonly destroyContainer: (path: Path) => Promise<void>
  readonly getMetadata: (path: Path) => Promise<Metadata>
}

export const getFileSystemConnection = async (path: string, userId: string, source: string) => {
  const connection: FileSystemAPI = await findConnection(
    source,
    userId
  )
  return {
    connection,
    path: new Path(path),
  }
}

export const api = {
  get: file.get,
  upload: file.upload,
  destroy: file.destroy,
  move: file.move,
  getContainerContent: folder.get,
  saveContainer: folder.save,
  destroyContainer: folder.destroy,
  getMetadata: file.getMetadata
}