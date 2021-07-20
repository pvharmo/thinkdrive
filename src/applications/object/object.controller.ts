import { Request, Response } from 'express'

import { Obj, pathToConnection } from '../../connections/interfaces'

export const get = async (req: Request, res: Response) => {
  const completePath = req.params[0]
  try {
    const { connection, path } = await pathToConnection(
      completePath,
      req.params.userId
    )
    const obj = await connection.get(path)
    res.status(200).json({ presignedUrl: obj.presignedUrl })
  } catch (e) {
    res.status(500).json({ message: 'An error has occurred' })
  }
}

export const create = async (req: Request, res: Response) => {
  const completePath = req.params[0]
  try {
    const { connection, path } = await pathToConnection(
      completePath,
      req.params.userId
    )
    const obj = await connection.create(path)
    res.status(201).json({
      message: 'Object successfully created',
      presignedUrl: obj.presignedUrl,
    })
  } catch (e) {
    res.status(500).json({ message: 'An error has occurred' })
  }
}

export const save = async (req: Request, res: Response) => {
  const completePath = req.params[0]
  try {
    const { connection, path } = await pathToConnection(
      completePath,
      req.params.userId
    )
    const obj: Obj = await connection.update(path)
    res.status(200).json({
      message: 'Object successfully saved',
      presignedUrl: obj.presignedUrl,
    })
  } catch (e) {
    res.status(500).json({ message: 'An error has occurred' })
  }
}

export const destroy = async (req: Request, res: Response) => {
  const completePath = req.params[0]
  try {
    const { connection, path } = await pathToConnection(
      completePath,
      req.params.userId
    )
    await connection.destroy(path)
    res.status(200).json({ message: 'Object successfully deleted' })
  } catch (e) {
    res.status(500).json({ message: 'An error has occurred' })
  }
}

export const getMetadata = async (req: Request, res: Response) => {
  const completePath = req.params[0]
  try {
    const { connection, path } = await pathToConnection(
      completePath,
      req.params.userId
    )
    const obj = await connection.getMetadata(path)
    res.status(200).json(obj)
  } catch (e) {
    res.status(500).json({ message: 'An error has occurred' })
    console.log(e)
  }
}

export const move = async (req: Request, res: Response) => {
  const completePath = req.params[0]

  try {
    const { connection, path } = await pathToConnection(
      completePath,
      req.params.userId
    )
    await connection.move(path, req.body.newPath)
    res.status(200).json({ message: 'Container successfully deleted' })
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'An error has occurred.' })
  }
}
