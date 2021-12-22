import { Client } from 'minio'

import {Path} from '../../path'
import {
  Child,
  Metadata,
  Obj,
} from '../../api/filesystem/filesystem.api'

import * as utils from './s3.utils'

export const get = async (path: Path, minio: Client): Promise<Obj> => {
  const [bucket, bucketPath] = path.extractRoot()
  const presignedUrl = await minio.presignedGetObject(bucket, bucketPath.path)
  return { presignedUrl }
}

export const destroy = async (path: Path, minio: Client): Promise<void> => {
  const [bucket, bucketPath] = path.extractRoot()
  await minio.removeObject(bucket, bucketPath.path)
}

export const upsert = async (path: Path, minio: Client): Promise<Obj> => {
  const [bucket, bucketPath] = path.extractRoot()
  const presignedUrl = await minio.presignedPutObject(bucket, bucketPath.path, 30)
  return { presignedUrl }
}

export const move = async (oldPath: Path, newPath: Path, minio: Client) => {
  const [oldBucket, oldBucketPath] = oldPath.extractRoot()
  const [newBucket, newBucketPath] = newPath.extractRoot()
  if (oldPath.isFolder) {
    utils.moveContainer(oldBucket, oldBucketPath, newBucketPath, minio)
  } else {
    utils.moveObject(newBucket, oldBucketPath, newBucketPath, minio)
  }
}

export const getContainerContent = async (path: Path, minio: Client): Promise<Child[]> => {
  const [bucket, bucketPath] = path.extractRoot()
  return utils.getContainerContent(bucket, bucketPath, minio)
}

export const saveContainer = async (path: Path, minio: Client): Promise<void> => {
  const [bucket, bucketPath] = path.extractRoot()
  await minio.putObject(bucket, bucketPath.path + '/.thinkdrive.container', '')
}

export const destroyContainer = async (path: Path, minio: Client): Promise<void> => {
  const [bucket, bucketPath] = path.extractRoot()
  const childrenStream = minio.listObjectsV2(bucket, bucketPath.path, true)
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

export const getMetadata = async (path: Path, minio: Client): Promise<Metadata> => {
  const [bucket, bucketPath] = path.extractRoot()
  const metadata = await minio.statObject(bucket, bucketPath.path)
  return {
    size: metadata.size,
    etag: metadata.etag,
    lastModified: metadata.lastModified,
  }
}