import { Client, CopyConditions } from 'minio'

import { Path } from '../../path'
import { Child } from '../../api/filesystem/filesystem.api'

export async function moveContainer(
  bucket: string,
  oldPath: Path,
  newPath: Path,
  minio: Client
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

export async function moveObject(bucket: string, oldPath: Path, newPath: Path, minio: Client) {
  const conditions = new CopyConditions()
  await minio.copyObject(
    bucket,
    newPath.path,
    `/${bucket}/${oldPath.path}`,
    conditions
  )
  await minio.removeObject(bucket, oldPath.path)
}

export async function getContainerContent(
  bucket: string,
  path: Path,
  minio: Client
): Promise<Child[]> {
  const childrenStream = minio.listObjectsV2(bucket, path.path + '/')
  const children = []
  for await (const child of childrenStream) {
    const splitIndex =
      (child.name?.lastIndexOf('/') ||
        child.prefix?.slice(0, -1)?.lastIndexOf('/')) + 1
    const name = child.name?.substring(splitIndex) || child.prefix?.slice(splitIndex, -1)
    children.push({
      type: child.prefix ? 'container' : 'object',
      name,
      location:
        '/' +
        (child.name?.substring(0, splitIndex) ||
          child.prefix?.substring(0, splitIndex) ||
          ''),
      lastModified: child.lastModified,
      contentUrl: bucket + path.path + '/' + name + (child.prefix? '/' : '')
    })
  }

  return children
}