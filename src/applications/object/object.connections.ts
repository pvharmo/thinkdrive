import { getConnection, Metadata, Obj } from '../../connections/interfaces'
import { newConnection as newLocalStorageConnection } from '../../connections/localStorage'

export interface Child {
  name: string
}

export interface Connection {
  readonly get: (path: string) => Promise<Obj>
  readonly store: (path: string, obj: Obj) => Promise<void>
}

export const get = async (path: string, userId: string): Promise<Obj> => {
  const [internalPath, distPath] = path.split('//')

  if (!distPath) {
    const connection = await newLocalStorageConnection(userId, userId)
    return await connection.get(internalPath)
  } else {
    const connection = await getConnection(internalPath, userId)
    return await connection.get(distPath)
  }
}

export const update = async (path: string, userId: string): Promise<Obj> => {
  const [internalPath, distPath] = path.split('//')
  if (!distPath) {
    const connection = await newLocalStorageConnection(userId, userId)
    return await connection.update(internalPath)
  } else {
    const connection = await getConnection(internalPath, userId)
    return await connection.update(distPath)
  }
}

export const create = async (path: string, userId: string): Promise<Obj> => {
  const [internalPath, distPath] = path.split('//')
  if (!distPath) {
    const connection = await newLocalStorageConnection(userId, userId)
    return await connection.create(internalPath)
  } else {
    const connection = await getConnection(internalPath, userId)
    return await connection.create(distPath)
  }
}

export const destroy = async (path: string, userId: string) => {
  const [internalPath, distPath] = path.split('//')
  if (!distPath) {
    const connection = await newLocalStorageConnection(userId, userId)
    await connection.destroy(internalPath)
  } else {
    const connection = await getConnection(internalPath, userId)
    await connection.destroy(distPath)
  }
}

export const getMetadata = async (
  path: string,
  userId: string
): Promise<Metadata> => {
  const [internalPath, distPath] = path.split('//')

  if (!distPath) {
    const connection = await newLocalStorageConnection(userId, userId)
    return await connection.getMetadata(internalPath)
  } else {
    const connection = await getConnection(internalPath, userId)
    return await connection.getMetadata(distPath)
  }
}

export const move = async (path: string, userId: string, newPath: string) => {
  const [internalPath, distPath] = path.split('//')

  if (!distPath) {
    const connection = await newLocalStorageConnection(userId, userId)
    return connection.move(internalPath, newPath)
  } else {
    const connection = await getConnection(internalPath, userId)
    return await connection.move(distPath, newPath)
  }
}
