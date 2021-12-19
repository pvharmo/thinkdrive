import util from 'util'

import mysql from 'mysql'



import {
  Child,
  Metadata,
  Obj,
  StandardConnection,
} from '../interfaces'


function makeDb( config ) {
  const connection = mysql.createConnection( config );  return {
    query( sql, args ) {
      return util.promisify( connection.query )
        .call( connection, sql, args );
    },
    close() {
      return util.promisify( connection.end ).call( connection );
    }
  };
}


export const createConnection = (_id: string, userId: string) => {
  const db = makeDb({
    host: process.env.MYSQL_HOST as string,
    user: process.env.MYSQL_USER as string,
    password: process.env.MYSQL_PASSWORD as string,
    database: process.env.MYSQL_DB as string
  })

  
  const connection: StandardConnection = {
    async get(path): Promise<Obj> {
      return {
        presignedUrl: ''
      }
    },
    async destroy(path): Promise<void> {
      // const [bucket, bucketPath] = path.extractRoot()
      // await repository.destroy(bucket, bucketPath)
    },
    async upsert(path): Promise<Obj> {
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
      if (path.path == "/") {
        const tables = await db.query('SHOW TABLES;', {})

        const files = tables?.map((file) => {
          return {name: file.Tables_in_db as string, id: file.Tables_in_db, type: "container", contentUrl: "/MySQL//" + file.Tables_in_db + '/'}
        })
        return files || []
  
      }

      const rows = await db.query('SELECT * FROM ' + path.name + ';', {})

      // console.log(rows)
  
      const files = rows.map((file) => {
        const keys = Object.keys(file)
        return {name: file[keys[1]] as string, id: file[keys[0]], type: "object", contentUrl: "/MySQL//" + file[keys[0]]}
      })
      return files || []
    },
    async saveContainer(path): Promise<void> {
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
    async newUser(): Promise<void> {
      // await repository.minio.makeBucket(userId, '')
      // await repository.minio.putObject(
      //   userId,
      //   '.trash/.restore.json',
      //   JSON.stringify({})
      // )
    },
  }

  return connection
}

export const newConnection = async (
  id: string,
  userId: string
): Promise<StandardConnection> => {
  return createConnection(id, userId)
}
