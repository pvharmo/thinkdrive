import * as authorization from '../../api/auth/authorization.repository'
import {
  Child,
  Metadata,
  Obj,
  FileSystemAPI,
} from '../../api/filesystem/filesystem.api'

import * as repository from './localstorage.repository'

export const createConnection = (_id: string, userId: string) => {
  const connection: FileSystemAPI = {
    async get(path): Promise<Obj> {
      await authorization.check({
        namespace: 'files',
        object: path.path,
        subject: userId,
        relation: 'get',
      })
      const [bucket, bucketPath] = path.extractRoot()
      return repository.get(bucket, bucketPath)
    },
    async destroy(path): Promise<void> {
      await authorization.check({
        namespace: 'files',
        object: path.path,
        subject: userId,
        relation: 'delete',
      })
      const [bucket, bucketPath] = path.extractRoot()
      await repository.destroy(bucket, bucketPath)
      await authorization.deletePermissionsForObject(path.path)
    },
    async upload(path): Promise<Obj> {
      await authorization.check({
        namespace: 'files',
        object: path.path,
        subject: userId,
        relation: 'update',
      })
      const [bucket, bucketPath] = path.extractRoot()
      return repository.upsert(bucket, bucketPath)
    },
    async move(oldPath, newPath) {
      await authorization.check({
        namespace: 'files',
        object: oldPath.path,
        subject: userId,
        relation: 'update',
      })
      const [oldBucket, oldBucketPath] = oldPath.extractRoot()
      const [newBucket, newBucketPath] = newPath.extractRoot()
      if (oldPath.isFolder) {
        repository.moveContainer(oldBucket, oldBucketPath, newBucketPath)
      } else {
        repository.moveObject(newBucket, oldBucketPath, newBucketPath)
      }
    },
    async getContainerContent(path): Promise<Child[]> {
      await authorization.check({
        namespace: 'files',
        object: path.path,
        subject: userId,
        relation: 'get',
      })
      const [bucket, bucketPath] = path.extractRoot()
      return repository.getContainerContent(bucket, bucketPath)
    },
    async saveContainer(path): Promise<void> {
      await authorization.check({
        namespace: 'files',
        object: path.path,
        subject: userId,
        relation: 'create',
      })
      const [bucket, bucketPath] = path.extractRoot()
      await repository.saveContainer(bucket, bucketPath)
    },
    async destroyContainer(path): Promise<void> {
      await authorization.check({
        namespace: 'files',
        object: path.path,
        subject: userId,
        relation: 'delete',
      })
      const [bucket, bucketPath] = path.extractRoot()
      repository.destroyContainer(bucket, bucketPath)
    },
    async getMetadata(path): Promise<Metadata> {
      await authorization.check({
        namespace: 'files',
        object: path.path,
        subject: userId,
        relation: 'delete',
      })
      const [bucket, bucketPath] = path.extractRoot()
      const metadata = await repository.getMetadata(bucket, bucketPath)
      return {
        size: metadata.size,
        etag: metadata.etag,
        lastModified: metadata.lastModified,
      }
    },
    // async newUser(): Promise<void> {
    //   await repository.minio.makeBucket(userId, '')
    //   await repository.minio.putObject(
    //     userId,
    //     '.trash/.restore.json',
    //     JSON.stringify({})
    //   )
    // },
  }

  return connection
}

export const newConnection = async (
  id: string,
  userId: string
): Promise<FileSystemAPI> => {
  return createConnection(id, userId)
}
