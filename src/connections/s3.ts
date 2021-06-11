import { Client } from 'minio'

import { Child, Obj, StandardConnection } from './interfaces'

export const newConnection = async (
  connectionId: string,
  userId: string
): Promise<StandardConnection> => {
  const minio = new Client({
    endPoint: 'localhost',
    port: 9000,
    useSSL: true,
    accessKey: 'admin',
    secretKey: 'password',
  })

  const connection = {
    async get(path: string) {
      return {
        content: await minio.getObject(userId, path),
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
    async store(path: string, obj: Obj) {
      try {
        minio.putObject(userId, path, obj.content)
        console.log('object saved on s3')
      } catch (e) {
        console.error(e)
      }
    },
    async saveContainer(path: string) {
      try {
        minio.putObject(userId, path + '.thinkdrive.folder', '')
        console.log('object saved on s3')
      } catch (e) {
        console.error(e)
      }
    },
    async destroy(path: string) {
      try {
        minio.removeObject(userId, path)
        console.log('object removed on s3')
      } catch (e) {
        console.error(e)
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
  }

  return connection
}
