import { Path } from '../../path'

import {
  getFileSystemConnection,
} from './filesystem.api'

export const get = async (user: string, body: any, source: string) => {
  const completePath = body.path

  try {
    const { connection, path } = await getFileSystemConnection(source, completePath, user)
    const object = await connection.getContainerContent(path)
    return {
      status: 200,
      body: object
    }
  } catch (error) {
    return {
      status: 500
    }
  }
}

export const save = async (user: string, body: any, source: string) => {
  const completePath = body.path

  try {
    const { connection, path } = await getFileSystemConnection(source, completePath, user)
    await connection.saveContainer(path)
    return {
      status: 201
    }
  } catch (e) {
    return {
      status: 500
    }
  }
}

export const destroy = async (user: string, body: any, source: string) => {
  const completePath = body.path

  try {
    const { connection, path } = await getFileSystemConnection(source, completePath, user)
    await connection.destroyContainer(path)
    return {
      status: 200
    }
  } catch (e) {
    return {
      status: 500
    }
  }
}

export const move = async (user: string, body: any, source: string) => {
  const completePath = body.path

  try {
    const { connection, path } = await getFileSystemConnection(source, completePath, user)
    await connection.move(path, new Path(body.newPath))
    return {
      status: 200
    }
  } catch (e) {
    return {
      status: 500
    }
  }
}
