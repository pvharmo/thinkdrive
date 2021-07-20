import ConnectionModel from '../models/Connection.model'

import { newConnection as newLocalStorageConnection } from './localStorage'
import { newConnection as newS3Connection } from './s3'

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
  name: string
}

export class NotFound extends Error {}
export class AlreadyExists extends Error {}

export interface StandardConnection {
  readonly get: (path: string) => Promise<Obj>
  readonly create: (path: string) => Promise<Obj>
  readonly update: (path: string) => Promise<Obj>
  readonly destroy: (path: string) => Promise<void>
  readonly move: (oldPath: string, newPath: string) => Promise<void>
  readonly getContainerContent: (path: string) => Promise<Child[]>
  readonly saveContainer: (path: string) => Promise<void>
  readonly destroyContainer: (path: string) => Promise<void>
  readonly getMetadata: (path: string) => Promise<Metadata>
}

export interface userScope {
  userId: string
  scopes: string[]
}

export interface SharingStatus {
  globalScopes?: string[]
  usersScope?: userScope[]
}

export interface Shareable {
  readonly updateSharingStatus: (
    path: string,
    sharingStatus: SharingStatus
  ) => Promise<void>
  readonly getSharingStatus: (path: string) => Promise<SharingStatus>
}

export const pathToConnection = async (path: string, userId: string) => {
  const [internalPath, distPath] = path.split('//')

  if (!distPath) {
    const connection = await newLocalStorageConnection(userId, userId)
    return {
      connection,
      path: internalPath,
    }
  } else {
    const connection: StandardConnection & Shareable = await getConnection(
      internalPath,
      userId
    )
    return {
      connection,
      path: distPath,
    }
  }
}

export const getConnection = async (internalPath: string, userId: string) => {
  const connectionResult = await ConnectionModel.findOne({
    where: { path: userId + '/' + internalPath },
  })

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

    default:
      return newLocalStorageConnection(connectionId, userId)
  }
}
