import { Router, Request, Response } from 'express'
import {google} from 'googleapis'

import { api as fileSystemAPI } from './api/filesystem/filesystem.api'
import * as auth from './api/auth/auth.controller'

const router: Router = Router()

interface Interfaces {
  filesystem: any
}

const requestInterfaces: Interfaces = {
  filesystem : fileSystemAPI
}

router.get('/oauth', (req, res) => {
  const credentials = {
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uris: [process.env.GOOGLE_REDIRECT_URI, 'http://localhost:3000/log', 'http://localhost:3000/oauth']
  } 
    
  console.log(credentials.client_id)
  
  const oAuth2Client = new google.auth.OAuth2(credentials.client_id, credentials.client_secret, credentials.redirect_uris[2]);

  console.log("code: ", req.query.code)
  
  try {
    oAuth2Client.getToken(req.query.code as string, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      // Store the token to disk for later program executions
      console.log(token);
      res.json(token)
    });
  } catch {
    res.json({error: "error"})
  }
})

router.put('/internal/new-user', auth.newUser)

router.post('/*', (req: Request, res: Response) => {
  const requestInterface: string = req.headers.interface as string
  const requestAction: string = req.headers.action as string
  const requestSource: string = req.headers.source as string
  const user: string = req.headers.user as string;

  const response = requestInterfaces[requestInterface as keyof Interfaces][requestAction](user, req.body, requestSource)

  res.status(response.status).json(response.body)
})


export default router
