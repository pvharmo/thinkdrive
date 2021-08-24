import { Request, Response } from 'express'

import {
  AlreadyExists,
  NotFound,
  getStandardConnection,
  getTrashableConnection,
} from '../../connections/interfaces'
import { Path } from '../../path'

export const get = async (req: Request, res: Response) => {
  const completePath = req.params[0]

  const { connection, path } = await getStandardConnection(
    completePath,
    req.params.userId
  )
  const object = await connection.getContainerContent(path)

  res.status(200).json(object)
}

export const save = async (req: Request, res: Response) => {
  const completePath = req.params[0]

  try {
    const { connection, path } = await getStandardConnection(
      completePath,
      req.params.userId
    )
    await connection.saveContainer(path)
    res.status(201).json({ message: 'Container successfully created' })
  } catch (e) {
    if (e instanceof NotFound) {
      res.status(404).json({ message: 'path not found' })
    } else if (e instanceof AlreadyExists) {
      res.status(400).json({ message: 'Container already exists' })
    }
    console.error(e)
    res.status(500).json({ message: 'An error has occurred.' })
  }
}

export const destroy = async (req: Request, res: Response) => {
  const completePath = req.params[0]

  try {
    const { connection, path } = await getStandardConnection(
      completePath,
      req.params.userId
    )
    await connection.destroyContainer(path)
    res.status(200).json({ message: 'Container successfully deleted' })
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'An error has occurred.' })
  }
}

export const move = async (req: Request, res: Response) => {
  const completePath = req.params[0]

  try {
    const { connection, path } = await getStandardConnection(
      completePath,
      req.params.userId
    )
    await connection.move(path, new Path(req.body.newPath))
    res.status(200).json({ message: 'Container successfully deleted' })
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'An error has occurred.' })
  }
}

export const trash = async (req: Request, res: Response) => {
  const completePath = req.params[0]

  try {
    const { connection, path } = await getTrashableConnection(
      completePath,
      req.params.userId
    )
    await connection.trash(path)
    res.status(200).json({ message: 'Container successfully deleted' })
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'An error has occurred.' })
  }
}
