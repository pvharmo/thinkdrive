import { Request, Response } from 'express'

import { createConnection } from '../../connections/localStorage'

export const newUser = async (req: Request, res: Response) => {
  const userId = req.body.user_id
  const localstorage = createConnection('', userId)
  localstorage.newUser()
  res.json({})
}
