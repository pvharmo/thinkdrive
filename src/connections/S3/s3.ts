import { Client } from 'minio'

import {
  Child,
  Metadata,
  Obj,
  FileSystemAPI,
} from '../../api/filesystem/filesystem.api'

import * as repository from './s3.repository'

export const newConnection = async (
  connectionId: string,
  userId: string
): Promise<FileSystemAPI> => {
  const minio = new Client({
    endPoint: 'localhost',
    port: 9000,
    useSSL: false,
    accessKey: 'admin',
    secretKey: 'password',
  })

  const connection: FileSystemAPI = {
    async get(path): Promise<Obj> {
      return repository.get(path, minio)
    },
    async destroy(path): Promise<void> {
      repository.destroy(path, minio)
    },
    async upload(path): Promise<Obj> {
      return repository.upsert(path, minio)
    },
    async move(oldPath, newPath) {
      return repository.move(oldPath, newPath, minio)
    },
    async getContainerContent(path): Promise<Child[]> {
      return repository.getContainerContent(path, minio)
    },
    async saveContainer(path): Promise<void> {
      repository.saveContainer(path, minio)
    },
    async destroyContainer(path): Promise<void> {
      repository.destroyContainer(path, minio)
    },
    async getMetadata(path): Promise<Metadata> {
      return repository.getMetadata(path, minio)
    },
  }

  return connection
}
