import { Request, Response } from 'express'

import { createConnection } from '../../connections/localStorage'

import * as authorization from './authorization.repository'

export const newUser = async (req: Request, res: Response) => {
  const userId = req.body.user_id
  const localStorage = createConnection('', userId)
  localStorage.newUser()
  const relations = ['get', 'create', 'delete', 'update']
  authorization.createRelationsForTuple(
    {
      namespace: 'files',
      object: userId,
      subject: userId,
    },
    relations
  )

  res.json({})
}
