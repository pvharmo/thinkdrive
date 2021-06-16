import { Request, Response } from 'express'

import { Obj } from '../../connections/interfaces'

import * as connection from './object.connections'

export const get = async (req: Request, res: Response) => {
  const completePath = req.params[0]
  try {
    const obj = await connection.get(completePath, req.params.userId)
    res.status(200).json({ presignedUrl: obj.presignedUrl })
  } catch (e) {
    res.status(500).json({ message: 'An error has occurred' })
  }
}

export const create = async (req: Request, res: Response) => {
  const completePath = req.params[0]

  try {
    const obj = await connection.create(completePath, req.params.userId)
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
    const obj: Obj = await connection.update(completePath, req.params.userId)
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
    await connection.destroy(completePath, req.params.userId)
    res.status(200).json({ message: 'Object successfully deleted' })
  } catch (e) {
    res.status(500).json({ message: 'An error has occurred' })
  }
}

export const getMetadata = async (req: Request, res: Response) => {
  const completePath = req.params[0]
  try {
    const obj = await connection.getMetadata(completePath, req.params.userId)
    res.status(200).json(obj)
  } catch (e) {
    res.status(500).json({ message: 'An error has occurred' })
    console.log(e)
  }
}
