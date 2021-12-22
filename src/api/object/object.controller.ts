import { NextFunction, Request, Response } from 'express'

import {
  Obj,
  getStandardConnection,
  getTrashableConnection,
} from '../../connections/interfaces'
import { Path } from '../../path'

export const get = async (req: Request, res: Response, next: NextFunction) => {
  const completePath = req.params[0]
  try {
    const { connection, path } = await getStandardConnection(
      completePath,
      req.headers['x-user'] as string
    )
    const obj = await connection.get(path)
    res.status(200).json({ presignedUrl: obj.presignedUrl })
  } catch (e) {
    next(e)
  }
}

export const upsert = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const completePath = req.params[0]
  try {
    const { connection, path } = await getStandardConnection(
      completePath,
      req.headers['x-user'] as string
    )
    const obj = await connection.upsert(path)
    res.status(201).json({
      message: 'Object successfully created',
      presignedUrl: obj.presignedUrl,
    })
  } catch (e) {
    next(e)
  }
}

export const save = async (req: Request, res: Response, next: NextFunction) => {
  const completePath = req.params[0]
  try {
    const { connection, path } = await getStandardConnection(
      completePath,
      req.headers['x-user'] as string
    )
    const obj: Obj = await connection.upsert(path)
    res.status(200).json({
      message: 'Object successfully saved',
      presignedUrl: obj.presignedUrl,
    })
  } catch (e) {
    next(e)
  }
}

export const destroy = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const completePath = req.params[0]
  try {
    const { connection, path } = await getStandardConnection(
      completePath,
      req.headers['x-user'] as string
    )
    await connection.destroy(path)
    res.status(200).json({ message: 'Object successfully deleted' })
  } catch (e) {
    next(e)
  }
}

export const getMetadata = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const completePath = req.params[0]
  try {
    const { connection, path } = await getStandardConnection(
      completePath,
      req.headers['x-user'] as string
    )
    const obj = await connection.getMetadata(path)
    res.status(200).json(obj)
  } catch (e) {
    next(e)
  }
}

export const move = async (req: Request, res: Response, next: NextFunction) => {
  const completePath = req.params[0]

  try {
    const { connection, path } = await getStandardConnection(
      completePath,
      req.headers['x-user'] as string
    )
    await connection.move(path, new Path(req.body.newPath))
    res.status(200).json({ message: 'Container successfully deleted' })
  } catch (e) {
    next(e)
  }
}

export const trash = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const completePath = req.params[0]

  try {
    const { connection, path } = await getTrashableConnection(
      completePath,
      req.headers['x-user'] as string
    )
    await connection.trash(path)
    res.status(200).json({ message: 'Container successfully deleted' })
  } catch (e) {
    next(e)
  }
}
