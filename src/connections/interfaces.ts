import { Path } from '../path'

import { newConnection as newLocalStorageConnection } from './localStorage/localStorage.service'
import { newConnection as newS3Connection } from './S3/s3'
import { newConnection as newGoogleDriveConnection } from './GoogleDrive/googledrive'
import { newConnection as newMysqlConnection } from './SQL/mysql'





export interface ObjectNotFound {
  readonly msg: string
}

export class NotFound extends Error {}
export class AlreadyExists extends Error {}

export interface TrashableConnection {
  readonly trash: (path: Path) => Promise<void>
}

export interface userScope {
  userId: string
  scopes: string[]
}

export const findConnection = async (source: string, userId: string) => {
  switch (source) {
    case 's3':
      return newS3Connection('', userId)

    case 'GoogleDrive':
      return newGoogleDriveConnection('', userId)

    case 'MySQL':
      return newMysqlConnection('', userId)

    default:
      return newLocalStorageConnection('', userId)
  }
}
