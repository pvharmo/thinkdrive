import {google} from 'googleapis'
import { Credentials } from 'google-auth-library';

import {
  Child,
  Metadata,
  Obj,
  FileSystemAPI,
} from '../../api/filesystem/filesystem.api'


const SCOPES = ['https://www.googleapis.com/auth/drive'];


export const createConnection = (_id: string, userId: string) => {
  function authorize({client_secret, client_id, redirect_uris}: {client_secret: string, client_id: string, redirect_uris: string[]}) {
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    const token: Credentials = {
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
      expiry_date: Number(process.env.GOOGLE_EXPIRY_DATE),
      access_token: process.env.GOOGLE_ACCESS_TOKEN,
      token_type: process.env.GOOGLE_TOKEN_TYPE,
      id_token: process.env.GOOGLE_ID_TOKEN,

    }

    oAuth2Client.setCredentials(token);
    return oAuth2Client;
  }

  const credentials = {
    client_secret: process.env.GOOGLE_CLIENT_SECRET as string,
    client_id: process.env.GOOGLE_CLIENT_SECRET as string,
    redirect_uris: [process.env.GOOGLE_CLIENT_SECRET as string, 'http://localhost:3000/log', 'http://localhost:3000/oauth']
  } 

  const auth = authorize(credentials);
  const drive = google.drive({version: 'v3', auth});

  
  const connection: FileSystemAPI = {
    async get(path): Promise<Obj> {
      console.log("test")
      console.log(path.path)
      let file
      try {
        // files = await drive.files.get({q: `name = '${path.path}'`, fields: 'files(webContentLink)'})
        file = await drive.files.get({fileId: path.path, fields: 'webViewLink'})
      } catch (e) {
        console.log(e)
      }
      return {
        presignedUrl: file?.data?.webViewLink as string
      }
    },
    async destroy(path): Promise<void> {
      // const [bucket, bucketPath] = path.extractRoot()
      // await repository.destroy(bucket, bucketPath)
    },
    async upload(path): Promise<Obj> {
      // const [bucket, bucketPath] = path.extractRoot()
      // return repository.upsert(bucket, bucketPath)
      return {
        presignedUrl: ''
      }
    },
    async move(oldPath, newPath) {
      // const [oldBucket, oldBucketPath] = oldPath.extractRoot()
      // const [newBucket, newBucketPath] = newPath.extractRoot()
      // if (oldPath.isFolder) {
      //   repository.moveContainer(oldBucket, oldBucketPath, newBucketPath)
      // } else {
      //   repository.moveObject(newBucket, oldBucketPath, newBucketPath)
      // }
    },
    async getContainerContent(path): Promise<Child[]> {
      let googleFilesReq
      try {
        if (!path.name) {
          googleFilesReq = await drive.files.list({q: `'root' in parents and trashed = false`,pageSize: 10, fields: 'nextPageToken, files(id, name, mimeType)'})
        } else {
          googleFilesReq = await drive.files.list({q: `'${path.name}' in parents and trashed = false`,pageSize: 10, fields: 'nextPageToken, files(id, name, mimeType)'})
        }
      } catch(e) {
        console.error(e)
      }

      const googleFiles = googleFilesReq?.data.files;
      const files = googleFiles?.map((file) => {
        let type
        if (file.mimeType == 'application/vnd.google-apps.folder') {
          type = "container"
        } else {
          type = "object"
        }
        return {name: file.name as string, id: file.id, type, contentUrl: "/GoogleDrive//" + file.id}
      })
      return files || []
    },
    async saveContainer(path): Promise<void> {
      const fileMetadata = {
        name: path.name,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [path.parent.name]
      };
      
      drive.files.create({requestBody: fileMetadata, fields: 'id'})
      // const [bucket, bucketPath] = path.extractRoot()
      // await repository.saveContainer(bucket, bucketPath)
    },
    async destroyContainer(path): Promise<void> {
      // const [bucket, bucketPath] = path.extractRoot()
      // repository.destroyContainer(bucket, bucketPath)
    },
    async getMetadata(path): Promise<Metadata> {
      // const [bucket, bucketPath] = path.extractRoot()
      // const metadata = await repository.getMetadata(bucket, bucketPath)
      // return {
      //   size: metadata.size,
      //   etag: metadata.etag,
      //   lastModified: metadata.lastModified,
      // }
      return {
        size: 0,
        etag: '',
        lastModified: new Date()
      }
    },
  }

  return connection
}

export const newConnection = async (
  id: string,
  userId: string
): Promise<FileSystemAPI> => {
  return createConnection(id, userId)
}
