import { Request, Response } from 'express'

import { createConnection } from '../../connections/localStorage'

import * as authorization from './auth.service'

export const newUser = async (req: Request, res: Response) => {
  const userId = req.body.user_id
  const localStorage = createConnection('', userId)
  localStorage.newUser()
  authorization.createRelationTuple({
    namespace: 'files',
    object: userId + '/',
    relation: 'GET',
    subject: userId,
  })
  authorization.createRelationTuple({
    namespace: 'files',
    object: userId + '/.trash/',
    relation: 'GET',
    subject: userId,
  })
  authorization.createRelationTuple({
    namespace: 'files',
    object: userId + '/.trash/.restore',
    relation: 'GET',
    subject: userId,
  })
  res.json({})
}
