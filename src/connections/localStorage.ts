import { Client, CopyConditions } from 'minio'

import { Path } from '../path'

import {
  Child,
  Metadata,
  Obj,
  StandardConnection,
  TrashableConnection,
} from './interfaces'

const minio = new Client({
  endPoint: 'localhost',
  port: 9000,
  useSSL: false,
  accessKey: 'admin',
  secretKey: 'password',
})

export const createConnection = (_id: string, userId: string) => {
  const connection: StandardConnection & TrashableConnection = {
    async get(path): Promise<Obj> {
      const presignedUrl = await minio.presignedGetObject(userId, path.path)
      return { presignedUrl }
    },
    async destroy(path): Promise<void> {
      await minio.removeObject(userId, path.path)
    },
    async upsert(path): Promise<Obj> {
      const presignedUrl = await minio.presignedPutObject(userId, path.path, 30)
      return { presignedUrl }
    },
    async move(oldPath, newPath) {
      const conditions = new CopyConditions()
      if (oldPath.isFolder) {
        const childrenStream = minio.listObjectsV2(userId, oldPath.path, true)
        for await (const child of childrenStream) {
          if (child.name) {
            const newName = child.name.replace(oldPath.path, newPath.path)
            await minio.copyObject(
              userId,
              newName,
              `/${userId}/${child.name}`,
              conditions
            )
            await minio.removeObject(userId, child.name)
          }
        }
      } else {
        await minio.copyObject(
          userId,
          newPath.path,
          `/${userId}/${oldPath.path}`,
          conditions
        )
        await minio.removeObject(userId, oldPath.path)
      }
    },
    async getContainerContent(path): Promise<Child[]> {
      const childrenStream = minio.listObjectsV2(userId, path.path)
      const children = []
      for await (const child of childrenStream) {
        const splitIndex =
          (child.name?.lastIndexOf('/') ||
            child.prefix?.slice(0, -1)?.lastIndexOf('/')) + 1
        children.push({
          type: child.prefix ? 'container' : 'object',
          name:
            child.name?.substring(splitIndex) ||
            child.prefix?.slice(splitIndex, -1),
          location:
            '/' +
            (child.name?.substring(0, splitIndex) ||
              child.prefix?.substring(0, splitIndex) ||
              ''),
          lastModified: child.lastModified,
        })
      }
      return children
    },
    async saveContainer(path): Promise<void> {
      await minio.putObject(userId, path + '.thinkdrive.container', '')
    },
    async destroyContainer(path): Promise<void> {
      const childrenStream = minio.listObjectsV2(userId, path.path, true)
      const children = []
      for await (const child of childrenStream) {
        children.push(child)
      }
      await minio.removeObjects(
        userId,
        children.map((x) => {
          return x.name
        })
      )
    },
    async getMetadata(path): Promise<Metadata> {
      const metadata = await minio.statObject(userId, path.path)
      return {
        size: metadata.size,
        etag: metadata.etag,
        lastModified: metadata.lastModified,
      }
    },
    async trash(path): Promise<void> {
      const fileStream = await minio.getObject(userId, '.trash/.restore.json')
      let fileContent = ''
      for await (const value of fileStream) {
        fileContent += value
      }
      const restore = JSON.parse(fileContent)
      const newPath = new Path(`.trash/` + path.name)
      await this.move(path, newPath)
      restore[newPath.path] = path
      minio.putObject(userId, '.trash/.restore.json', JSON.stringify(restore))
    },
  }

  return connection
}

export const newConnection = async (
  id: string,
  userId: string
): Promise<StandardConnection & TrashableConnection> => {
  return createConnection(id, userId)
}
