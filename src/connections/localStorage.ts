import { Client } from 'minio'
import { UniqueConstraintError } from 'sequelize'

import {
  AlreadyExists,
  Child,
  Metadata,
  Obj,
  StandardConnection,
} from './interfaces'

const minio = new Client({
  endPoint: 'localhost',
  port: 9000,
  useSSL: false,
  accessKey: 'admin',
  secretKey: 'password',
})

export const createConnection = (_id: string, userId: string) => {
  const connection: StandardConnection = {
    async get(path: string): Promise<Obj> {
      const presignedUrl = await minio.presignedGetObject(userId, path)
      return { presignedUrl }
    },
    async destroy(path: string): Promise<void> {
      await minio.removeObject(userId, path)
    },
    async update(path: string): Promise<Obj> {
      const presignedUrl = await minio.presignedPutObject(userId, path, 30)
      return { presignedUrl }
    },
    async create(path: string): Promise<Obj> {
      try {
        const presignedUrl = await minio.presignedPutObject(userId, path, 30)
        return { presignedUrl }
      } catch (e) {
        if (e instanceof UniqueConstraintError) {
          throw new AlreadyExists()
        } else {
          throw e
        }
      }
    },
    async getContainerContent(path: string): Promise<Child[]> {
      const childrenStream = minio.listObjectsV2(userId, path)
      const children = []
      for await (const child of childrenStream) {
        children.push(child)
      }
      return children
    },
    async saveContainer(path: string): Promise<void> {
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
  }

  return connection
}

export const newConnection = async (
  id: string,
  userId: string
): Promise<StandardConnection> => {
  return createConnection(id, userId)
}
