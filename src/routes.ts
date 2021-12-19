import { Router } from 'express'
import {google} from 'googleapis'

import * as container from './applications/container/container.controller'
import * as obj from './applications/object/object.controller'
import * as share from './applications/share/share.controller'
import * as auth from './applications/auth/auth.controller'

const router: Router = Router()

router.post('/log', (req, res) => {
  console.log(req)
  console.log(req.body)
  res.json({})
})
router.get('/log', (req, res) => {
  console.log(req)
  console.log(req.body)
  res.json({})
})
router.put('/log', (req, res) => {
  console.log(req)
  console.log(req.body)
  res.json({})
})

router.get('/oauth', (req, res) => {
  const credentials = {
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uris: [process.env.GOOGLE_REDIRECT_URI, 'http://localhost:3000/log', 'http://localhost:3000/oauth']
  } 
  
  const SCOPES = ['https://www.googleapis.com/auth/drive.metadata.readonly'];
  
  console.log(credentials.client_id)
  
  const oAuth2Client = new google.auth.OAuth2(credentials.client_id, credentials.client_secret, credentials.redirect_uris[2]);

  console.log("code: ", req.query.code)
  
  try {
    oAuth2Client.getToken(req.query.code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      // Store the token to disk for later program executions
      console.log(token);
      res.json(token)
    });
  } catch {
    res.json({error: "error"})
  }
})

router.post('/internal/new-user', auth.newUser)

router.get('/container/*', container.get)
router.post('/container/*', container.save)
router.delete('/container/*', container.destroy)
router.put('/container/move/*', container.move)
router.put('/container/trash/*', container.trash)

router.get('/object/*', obj.get)
router.post('/object/*', obj.upsert)
router.delete('/object/*', obj.destroy)
router.put('/object/move/*', obj.move)
router.put('/object/trash/*', obj.trash)

router.get('/metadata/*', obj.getMetadata)

router.get('/share/*', share.getStatus)
router.put('/share/*', share.setStatus)

export default router
