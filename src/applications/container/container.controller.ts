import { NextFunction, Request, Response } from 'express'

import {
  getStandardConnection,
  getTrashableConnection,
} from '../../connections/interfaces'
import { Path } from '../../path'

export const get = async (req: Request, res: Response, next: NextFunction) => {
  const completePath = req.params[0]

  const { connection, path } = await getStandardConnection(
    completePath,
    req.headers['x-user'] as string
  )
  let object

  try {
    object = await connection.getContainerContent(path)
  } catch (error) {
    next(error)
  }

  res.status(200).json(object)
}

export const save = async (req: Request, res: Response, next: NextFunction) => {
  const completePath = req.params[0]

  try {
    const { connection, path } = await getStandardConnection(
      completePath,
      req.headers['x-user'] as string
    )
    await connection.saveContainer(path)
    res.status(201).json({ message: 'Container successfully created' })
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
    await connection.destroyContainer(path)
    res.status(200).json({ message: 'Container successfully deleted' })
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
