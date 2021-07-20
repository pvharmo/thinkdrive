import { Client, CopyConditions } from 'minio'
import { UniqueConstraintError } from 'sequelize'

import SharingStatusModel from '../models/SharingStatus.model'

import {
  AlreadyExists,
  Child,
  Metadata,
  Obj,
  StandardConnection,
  Shareable,
} from './interfaces'

const minio = new Client({
  endPoint: 'localhost',
  port: 9000,
  useSSL: false,
  accessKey: 'admin',
  secretKey: 'password',
})

export const createConnection = (_id: string, userId: string) => {
  const connection: StandardConnection & Shareable = {
    async get(path: string): Promise<Obj> {
      const presignedUrl = await minio.presignedGetObject(userId, path)
      return { presignedUrl }
    },
    async destroy(path: string): Promise<void> {
      this.updateSharingStatus(path, {})
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
              child.prefix?.substring(0, splitIndex)),
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
        this.updateSharingStatus(
          child.name.replace('.thinkdrive.container', ''),
          {}
        )
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
    async updateSharingStatus(path, sharingStatus) {
      const fullPath = '/' + userId + '/' + path
      const status = await SharingStatusModel.findOne({
        where: { path: fullPath },
      })

      if (status !== null) {
        if (!sharingStatus.globalScopes && !sharingStatus.usersScope) {
          await SharingStatusModel.destroy({
            where: {
              path: fullPath,
            },
          })
        } else {
          await SharingStatusModel.update(
            { scopes: sharingStatus },
            { where: { path: fullPath } }
          )
        }
      } else {
        if (!!sharingStatus.globalScopes || !!sharingStatus.usersScope) {
          await SharingStatusModel.create({
            path: fullPath,
            scopes: sharingStatus,
          })
        }
      }
    },
    async getSharingStatus(path) {
      const isContainer = path[path.length - 1] === '/'
      const pathSplit = path.split('/')
      let sharingStatus
      for (let pathLength = 0; pathLength < pathSplit.length; pathLength++) {
        const localPath = pathSplit.slice(0, -pathLength).join('/')
        const searchPath = `/${userId}/${localPath}${isContainer ? '/' : ''}`

        sharingStatus = await SharingStatusModel.findOne({
          where: { path: searchPath },
        })

        if (sharingStatus) {
          break
        }
      }
      if (sharingStatus) {
        return sharingStatus.scopes
      }
      return {
        globalScopes: [],
        usersScope: [],
      }
    },
  }

  return connection
}

export const newConnection = async (
  id: string,
  userId: string
): Promise<StandardConnection & Shareable> => {
  return createConnection(id, userId)
}
