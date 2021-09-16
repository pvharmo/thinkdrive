import { Client, CopyConditions } from 'minio'

import { Path } from '../../path'
import { Metadata, Obj, Child } from '../interfaces'

export const minio = new Client({
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
  return await minio.statObject(bucket, path.path)
}

export async function getContainerContent(
  bucket: string,
  path: Path
): Promise<Child[]> {
  const childrenStream = minio.listObjectsV2(bucket, path.path)
  const children = []
  for await (const child of childrenStream) {
    const splitIndex =
      (child.name?.lastIndexOf('/') ||
        child.prefix?.slice(0, -1)?.lastIndexOf('/')) + 1
    children.push({
      type: child.prefix ? 'container' : 'object',
      name:
        child.name?.substring(splitIndex) ||
        child.prefix?.slice(splitIndex, -1),
      location:
        '/' +
        (child.name?.substring(0, splitIndex) ||
          child.prefix?.substring(0, splitIndex) ||
          ''),
      lastModified: child.lastModified,
    })
  }
  return children
}

export async function saveContainer(bucket: string, path: Path): Promise<void> {
  await minio.putObject(bucket, path.path + '/.thinkdrive.container', '')
}

export async function destroyContainer(
  bucket: string,
  path: Path
): Promise<void> {
  const childrenStream = minio.listObjectsV2(bucket, path.path, true)
  const children = []
  for await (const child of childrenStream) {
    children.push(child)
  }
  await minio.removeObjects(
    bucket,
    children.map((x) => {
      return x.name
    })
  )
}

export async function getObjectContent(bucket: string, path: Path) {
  const fileStream = await minio.getObject(bucket, path.path)
  let fileContent = ''
  for await (const value of fileStream) {
    fileContent += value
  }
  return fileContent
}

export async function saveObjectContent(
  bucket: string,
  path: Path,
  content: string
) {
  minio.putObject(bucket, path.path, content)
}
