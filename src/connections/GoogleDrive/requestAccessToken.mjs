import readline from 'readline'

import dotenv from 'dotenv'
import {google} from 'googleapis'

dotenv.config({ path: '../../../.env' })

const credentials = {
  client_secret: process.env.GOOGLE_CLIENT_SECRET,
  client_id: process.env.GOOGLE_CLIENT_ID,
  redirect_uris: [process.env.GOOGLE_REDIRECT_URI, 'http://localhost:3000/log', 'http://localhost:3000/oauth']
} 

const SCOPES = ['https://www.googleapis.com/auth/drive'];

console.log(credentials.client_id)

const oAuth2Client = new google.auth.OAuth2(credentials.client_id, credentials.client_secret, credentials.redirect_uris[2]);
const authUrl = oAuth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: SCOPES,
});
console.log('Authorize this app by visiting this url:', authUrl);
