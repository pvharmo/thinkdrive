import {
  Child,
  Metadata,
  Obj,
  StandardConnection,
} from '../interfaces'


const SCOPES = ['https://www.googleapis.com/auth/drive'];


export const createConnection = (_id: string, userId: string) => {  
  const connection: StandardConnection = {
    async get(path): Promise<Obj> {
      // const [bucket, bucketPath] = path.extractRoot()
      // return repository.get(bucket, bucketPath)
      return {
        presignedUrl: ''
      }
    },
    async destroy(path): Promise<void> {
      // const [bucket, bucketPath] = path.extractRoot()
      // await repository.destroy(bucket, bucketPath)
    },
    async upsert(path): Promise<Obj> {
      // const [bucket, bucketPath] = path.extractRoot()
      // return repository.upsert(bucket, bucketPath)
      return {
        presignedUrl: ''
      }
    },
    async move(oldPath, newPath) {
      // const [oldBucket, oldBucketPath] = oldPath.extractRoot()
      // const [newBucket, newBucketPath] = newPath.extractRoot()
      // if (oldPath.isFolder) {
      //   repository.moveContainer(oldBucket, oldBucketPath, newBucketPath)
      // } else {
      //   repository.moveObject(newBucket, oldBucketPath, newBucketPath)
      // }
    },
    async getContainerContent(path): Promise<Child[]> {
      return [
        {name: 'Google Drive', type: 'container', contentUrl: '/GoogleDrive//'},
        {name: 'OneDrive', type: 'container', contentUrl: '/OneDrive//'},
        {name: 'Dropbox', type: 'container', contentUrl: '/Dropbox//'},
        {name: 'MySQL', type: 'container', contentUrl: '/MySQL//'},
      ]
    },
    async saveContainer(path): Promise<void> {
      // const [bucket, bucketPath] = path.extractRoot()
      // await repository.saveContainer(bucket, bucketPath)
    },
    async destroyContainer(path): Promise<void> {
      // const [bucket, bucketPath] = path.extractRoot()
      // repository.destroyContainer(bucket, bucketPath)
    },
    async getMetadata(path): Promise<Metadata> {
      // const [bucket, bucketPath] = path.extractRoot()
      // const metadata = await repository.getMetadata(bucket, bucketPath)
      // return {
      //   size: metadata.size,
      //   etag: metadata.etag,
      //   lastModified: metadata.lastModified,
      // }
      return {
        size: 0,
        etag: '',
        lastModified: new Date()
      }
    },
    async newUser(): Promise<void> {
      // await repository.minio.makeBucket(userId, '')
      // await repository.minio.putObject(
      //   userId,
      //   '.trash/.restore.json',
      //   JSON.stringify({})
      // )
    },
  }

  return connection
}

export const newConnection = async (
  id: string,
  userId: string
): Promise<StandardConnection> => {
  return createConnection(id, userId)
}
