import { Path } from '../path'

import { newConnection as newDispatcher } from './dispatcher/dispatcher'
import { newConnection as newLocalStorageConnection } from './localStorage/localStorage.service'
import { newConnection as newS3Connection } from './s3'
import { newConnection as newGoogleDriveConnection } from './GoogleDrive/googledrive'
import { newConnection as newMysqlConnection } from './SQL/mysql'

export interface PresignedUrl extends String {}

export interface Obj {
  presignedUrl: PresignedUrl
}

export interface Metadata {
  size: number
  etag: string
  lastModified: Date
}

export interface ObjectNotFound {
  readonly msg: string
}

export interface Child {
  name: string,
  type: string,
  contentUrl: string
}

export class NotFound extends Error {}
export class AlreadyExists extends Error {}

export interface StandardConnection {
  readonly get: (path: Path) => Promise<Obj>
  readonly upsert: (path: Path) => Promise<Obj>
  readonly destroy: (path: Path) => Promise<void>
  readonly move: (oldPath: Path, newPath: Path) => Promise<void>
  readonly getContainerContent: (path: Path) => Promise<Child[]>
  readonly saveContainer: (path: Path) => Promise<void>
  readonly destroyContainer: (path: Path) => Promise<void>
  readonly getMetadata: (path: Path) => Promise<Metadata>
  readonly newUser: () => Promise<void>
}

export interface TrashableConnection {
  readonly trash: (path: Path) => Promise<void>
}

export interface userScope {
  userId: string
  scopes: string[]
}

export const getTrashableConnection = async (path: string, userId: string) => {
  const pathSplit = path.split('//')
  const internalPath = new Path(pathSplit[0])
  const distPath = new Path(pathSplit[1])

  if (distPath.isEmpty) {
    const connection = await newLocalStorageConnection(userId, userId)
    return {
      connection,
      path: internalPath,
    }
  } else {
    const connection: TrashableConnection = await findConnection(
      internalPath,
      userId
    )
    return {
      connection,
      path: distPath,
    }
  }
}

export const getStandardConnection = async (path: string, userId: string) => {
  const pathSplit = path.split('//')
  const internalPath = new Path(pathSplit[0])
  let distPath = new Path(pathSplit[1])
  if (pathSplit.length == 2 && !pathSplit[1]) {
    distPath = new Path('/')
  }

  if (distPath.isEmpty) {
    const connection = await newDispatcher(userId, userId)
    return {
      connection,
      path: internalPath,
    }
  } else {
    const connection: StandardConnection = await findConnection(
      internalPath,
      userId
    )
    return {
      connection,
      path: distPath,
    }
  }
}

export const findConnection = async (internalPath: Path, userId: string) => {
  const connectionResult = {
    connection_type: internalPath.name,
    connection_id: '',
  }

  if (connectionResult) {
    return toConnection(
      connectionResult.connection_type,
      connectionResult.connection_id,
      userId
    )
  } else {
    throw new NotFound('internalPath')
  }
}

export const toConnection = (
  connectionType: string,
  connectionId: string,
  userId: string
): Promise<any> => {
  switch (connectionType) {
    case 's3':
      return newS3Connection(connectionId, userId)

    case 'GoogleDrive':
      return newGoogleDriveConnection(connectionId, userId)

    case 'MySQL':
      return newMysqlConnection(connectionId, userId)

    default:
      return newLocalStorageConnection(connectionId, userId)
  }
}
