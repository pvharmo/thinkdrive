import { Child, ObjectNotFound } from '../../connections/interfaces'
import { getConnection } from '../../connections/interfaces'
import { newConnection as newLocalStorageConnection } from '../../connections/localStorage'

export const get = async (
  path: string,
  userId: string
): Promise<Child[] | ObjectNotFound> => {
  const [internalPath, distPath] = path.split('//')

  if (!distPath) {
    const connection = await newLocalStorageConnection(userId, userId)
    return connection.getContainerContent(internalPath)
  } else {
    const connection = await getConnection(internalPath, userId)
    return await connection.getContainerContent(distPath)
  }
}

export const save = async (path: string, userId: string) => {
  let [internalPath, distPath] = path.split('//')
  if (!distPath) {
    if (internalPath.slice(-1) !== '/') {
      internalPath += '/'
    }
    const connection = await newLocalStorageConnection(userId, userId)
    await connection.saveContainer(internalPath)
  } else {
    if (distPath.slice(-1) !== '/') {
      distPath += '/'
    }
    const connection = await getConnection(internalPath, userId)
    await connection.saveContainer(distPath)
  }
}
