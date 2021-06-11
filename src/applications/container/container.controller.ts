import { Request, Response } from 'express'

import { AlreadyExists, NotFound } from '../../connections/interfaces'

import * as connection from './container.connections'

export const get = async (req: Request, res: Response) => {
  const completePath = req.params[0]
  const object = await connection.get(completePath, req.params.userId)

  res.status(200).json(object)
}

export const save = async (req: Request, res: Response) => {
  const userId = req.params.userId

  try {
    await connection.save(req.params[0], userId)
    res.status(201).json({ message: 'Object successfully stored' })
  } catch (e) {
    if (e instanceof NotFound) {
      res.status(404).json({ message: 'path not found' })
    } else if (e instanceof AlreadyExists) {
      res.status(400).json({ message: 'Folder already exists' })
    }
    console.error(e)
    res.status(500).json({ message: 'An error has occurred.' })
  }
}
