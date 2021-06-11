import { Request, Response } from 'express'

import { Obj } from '../../connections/interfaces'

import * as connection from './object.connections'

export const get = async (req: Request, res: Response) => {
  const completePath = req.params[0]
  try {
    const object = await connection.get(completePath, req.params.userId)
    res.status(200).json(object)
  } catch (e) {
    res.status(500).json({ message: 'An error has occurred' })
  }
}

export const create = async (req: Request, res: Response) => {
  const completePath = req.params[0]
  const object: Obj = req.body.object
  try {
    await connection.create(completePath, object, req.params.userId)
    res.status(201).json({ message: 'Object successfully created' })
  } catch (e) {
    res.status(500).json({ message: 'An error has occurred' })
  }
}

export const save = async (req: Request, res: Response) => {
  const completePath = req.params[0]
  const object: Obj = req.body.object
  try {
    connection.save(completePath, object, req.params.userId)
    res.status(200).json({ message: 'Object successfully saved' })
  } catch (e) {
    res.status(500).json({ message: 'An error has occurred' })
  }
}

export const destroy = async (req: Request, res: Response) => {
  const completePath = req.params[0]
  try {
    await connection.destroy(completePath, req.params.userId)
    res.status(200).json({ message: 'Object successfully deleted' })
  } catch (e) {
    res.status(500).json({ message: 'An error has occurred' })
  }
}
