import { Client } from 'minio'
import { UniqueConstraintError } from 'sequelize'

import { AlreadyExists, Child, Obj, StandardConnection } from './interfaces'

const minio = new Client({
  endPoint: 'localhost',
  port: 9000,
  useSSL: false,
  accessKey: 'admin',
  secretKey: 'password',
})

export const createConnection = (id: string, userId: string) => {
  const connection: StandardConnection = {
    async getContainerContent(path: string): Promise<Child[]> {
      const childrenStream = minio.listObjectsV2(userId, path)
      const children = []
      for await (const child of childrenStream) {
        children.push(child)
      }
      return children
    },
    async get(path: string): Promise<Obj> {
      const myObj: Obj = {
        content: 'test',
      }
      return myObj
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
    async store(path: string, obj: Obj): Promise<void> {
      console.log(obj)
      try {
        await minio.putObject(userId, path, obj.content)
        console.log('object saved locally')
      } catch (e) {
        if (e instanceof UniqueConstraintError) {
          throw new AlreadyExists()
        } else {
          throw e
        }
      }
    },
    async destroy(path: string): Promise<void> {
      await minio.removeObject(userId, path)
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

export const newConnection = async (
  id: string,
  userId: string
): Promise<StandardConnection> => {
  return createConnection(id, userId)
}
