import { Client, CopyConditions } from 'minio'
import { UniqueConstraintError } from 'sequelize'

import {
  AlreadyExists,
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
    async get(path: string): Promise<Obj> {
      const presignedUrl = await minio.presignedGetObject(userId, path)
      return { presignedUrl }
    },
    async destroy(path: string): Promise<void> {
      await minio.removeObject(userId, path)
    },
    async upsert(path: string): Promise<Obj> {
      const presignedUrl = await minio.presignedPutObject(userId, path, 30)
      return { presignedUrl }
    },
    async move(oldPath, newPath) {
      const conditions = new CopyConditions()
      if (oldPath[oldPath.length - 1] === '/') {
        const childrenStream = minio.listObjectsV2(userId, oldPath)
        for await (const child of childrenStream) {
          if (child.name) {
            const newName = child.name.replace(oldPath, newPath)
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
          newPath,
          `/${userId}/${oldPath}`,
          conditions
        )
        await minio.removeObject(userId, oldPath)
      }
    },
    async getContainerContent(path: string): Promise<Child[]> {
      const childrenStream = minio.listObjectsV2(userId, path)
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
    async saveContainer(path: string): Promise<void> {
      if (path.slice(-1) !== '/') {
        path += '/'
      }
      try {
        await minio.putObject(userId, path + '.thinkdrive.container', '')
        console.log('container saved locally')
      } catch (e) {
        if (e instanceof UniqueConstraintError) {
          throw new AlreadyExists()
        } else {
          throw e
        }
      }
    },
    async destroyContainer(path: string): Promise<void> {
      const childrenStream = minio.listObjectsV2(userId, path, true)
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
    async getMetadata(path: string): Promise<Metadata> {
      const metadata = await minio.statObject(userId, path)
      return {
        size: metadata.size,
        etag: metadata.etag,
        lastModified: metadata.lastModified,
      }
    },
    async trash(path: string): Promise<void> {
      this.move(path, `${userId}/.trash${path}`)
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
