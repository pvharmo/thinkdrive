import ConnectionModel from './connections.repository'
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
  readonly getContainerContent: (path: string) => Promise<Child[]>
  readonly saveContainer: (path: string) => Promise<void>
  readonly destroyContainer: (path: string) => Promise<void>
  readonly getMetadata: (path: string) => Promise<Metadata>
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
