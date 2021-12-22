import { Path } from '../../path'

import {
  Obj,
  getFileSystemConnection,
} from './filesystem.api'


export const get = async (user: string, body: any, source: string) => {
  const completePath = body.path
  try {
    const { connection, path } = await getFileSystemConnection(
      source,
      completePath,
      user
    )
    const obj = await connection.get(path)
    return {
      status : 200,
      body: {
        presignedUrl: obj.presignedUrl
      }
    }
  } catch (e) {
    return {
      status : 500
    }
  }
}

export const upload = async (user: string, body: any, source: string) => {
  const completePath = body.path
  try {
    const { connection, path } = await getFileSystemConnection(source, completePath, user)
    const obj = await connection.upload(path)
    return {
      status: 201,
      body: {
        presignedUrl: obj.presignedUrl
      }
    }
  } catch (e) {
    return {
      status : 500
    }
  }
}

export const save = async (user: string, body: any, source: string) => {
  const completePath = body.path
  try {
    const { connection, path } = await getFileSystemConnection(source, completePath, user)
    const obj: Obj = await connection.upload(path)
    return {
      status: 200,
      body: {
        presignedUrl: obj.presignedUrl
      }
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
    await connection.destroy(path)
    return {
      status: 200
    }
  } catch (e) {
    return {
      status: 500
    }
  }
}

export const getMetadata = async (user: string, body: any, source: string) => {
  const completePath = body.path
  try {
    const { connection, path } = await getFileSystemConnection(source, completePath, user)
    const obj = await connection.getMetadata(path)
    return {
      status: 200,
      body: {
        obj
      }
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
