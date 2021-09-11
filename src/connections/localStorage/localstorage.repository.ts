import { Client, CopyConditions } from 'minio'

import { Path } from '../../path'
import { Metadata, Obj } from '../interfaces'

const minio = new Client({
  endPoint: 'localhost',
  port: 9000,
  useSSL: false,
  accessKey: 'admin',
  secretKey: 'password',
})

export async function get(bucket: string, path: Path): Promise<Obj> {
  const presignedUrl = await minio.presignedGetObject(bucket, path.path)
  return { presignedUrl }
}

export async function destroy(bucket: string, path: Path): Promise<void> {
  await minio.removeObject(bucket, path.path)
}

export async function upsert(bucket: string, path: Path): Promise<Obj> {
  const presignedUrl = await minio.presignedPutObject(bucket, path.path, 30)
  return { presignedUrl }
}

export async function moveContainer(
  bucket: string,
  oldPath: Path,
  newPath: Path
) {
  const conditions = new CopyConditions()
  const childrenStream = minio.listObjectsV2(bucket, oldPath.path, true)
  for await (const child of childrenStream) {
    if (child.name) {
      const newName = child.name.replace(oldPath.path, newPath.path)
      await minio.copyObject(
        bucket,
        newName,
        `/${bucket}/${child.name}`,
        conditions
      )
      await minio.removeObject(bucket, child.name)
    }
  }
}

export async function moveObject(bucket: string, oldPath: Path, newPath: Path) {
  const conditions = new CopyConditions()
  await minio.copyObject(
    bucket,
    newPath.path,
    `/${bucket}/${oldPath.path}`,
    conditions
  )
  await minio.removeObject(bucket, oldPath.path)
}

export async function getMetadata(
  bucket: string,
  path: Path
): Promise<Metadata> {
  const metadata = await minio.statObject(bucket, path.path)
  return {
    size: metadata.size,
    etag: metadata.etag,
    lastModified: metadata.lastModified,
  }
}
