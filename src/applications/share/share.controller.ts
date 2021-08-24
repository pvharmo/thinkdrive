import { Request, Response } from 'express'

import { getStandardConnection } from '../../connections/interfaces'

export const getStatus = async (req: Request, res: Response) => {
  const completePath = req.params[0]

  try {
    const { connection, path } = await getStandardConnection(
      completePath,
      req.params.userId
    )
    const status = await connection.getSharingStatus(path)
    res.status(200).json(status)
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'An error has occurred.' })
  }
}

export const setStatus = async (req: Request, res: Response) => {
  const completePath = req.params[0]

  try {
    const { connection, path } = await getStandardConnection(
      completePath,
      req.params.userId
    )
    await connection.updateSharingStatus(path, req.body.sharingStatus)
    res.status(200).json({ message: 'Updated sharing status' })
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'An error has occurred.' })
  }
}
