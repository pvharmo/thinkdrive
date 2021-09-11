import { Client } from 'minio'

import UnauthorizedException from './UnauthorizedException'

const client = new Client({
  endPoint: 'localhost',
  port: 9000,
  useSSL: false,
  accessKey: 'admin',
  secretKey: 'password',
})

interface PermissionTuple {
  namespace: string
  object: string
  relation: string
  subject: string
}

interface PartialPermissionTuple {
  namespace: string
  object: string
  subject: string
}

interface PermissionTupleWithoutSubject {
  namespace: string
  object: string
  relation: string
}

const permissionsPath = (path: string) => {
  const [bucket, ...bucketPath] = path.split('/')
  return {
    bucket,
    bucketPath: bucketPath.join('/') + '.__permissions',
  }
}

const getPermissions = async (path: string): Promise<PermissionTuple[]> => {
  const { bucket, bucketPath } = permissionsPath(path)
  const fileStream = await client.getObject(bucket, bucketPath)
  let fileContent = ''
  for await (const value of fileStream) {
    fileContent += value
  }
  return JSON.parse(fileContent)
}

const savePermissions = async (
  path: string,
  permissions: PermissionTuple[]
) => {
  const { bucket, bucketPath } = permissionsPath(path)
  client.putObject(bucket, bucketPath, JSON.stringify(permissions))
}

export const deletePermissionsForObject = async (path: string) => {
  const { bucket, bucketPath } = permissionsPath(path)
  await client.removeObject(bucket, bucketPath)
}

export const createRelationTuple = async (tuple: PermissionTuple) => {
  const permissions = await getPermissions(tuple.object)
  permissions.push(tuple)
  savePermissions(tuple.object, permissions)
}

export const createRelationsForTuple = async (
  partialTuple: PartialPermissionTuple,
  relations: string[]
) => {
  const permissions = await getPermissions(partialTuple.object)
  for (const relation in relations) {
    const tuple = {
      namespace: partialTuple.namespace,
      object: partialTuple.object,
      subject: partialTuple.subject,
      relation: relation,
    }
    permissions.push(tuple)
  }

  savePermissions(partialTuple.object, permissions)
}

export const deleteRelationTuple = async (tuple: PermissionTuple) => {
  const permissions = await getPermissions(tuple.object)
  const newPermissions = permissions.filter((x) => x != tuple)
  savePermissions(tuple.object, newPermissions)
}

export const deleteAllSubjectFromRelation = async (
  tuple: PermissionTupleWithoutSubject
) => {
  const permissions = await getPermissions(tuple.object)
  const newPermissions = permissions.filter((x) => {
    return x.namespace !== tuple.namespace && x.relation !== tuple.relation
  })
  savePermissions(tuple.object, newPermissions)
}

export const deleteRelationsForTuple = async (
  partialTuple: PartialPermissionTuple,
  relations: string[]
) => {
  const newPermissions = []
  const permissions = await getPermissions(partialTuple.object)
  for (const relation in relations) {
    for (const permission of permissions) {
      if (permission.relation !== relation) {
        newPermissions.push(permission)
      }
    }
  }
  savePermissions(partialTuple.object, newPermissions)
}

export const updateRelationTuple = async (
  oldTuple: PermissionTuple,
  newTuple: PermissionTuple
) => {
  deleteRelationTuple(oldTuple)
  createRelationTuple(newTuple)
}

export const updateRelationsForTuple = async (
  partialTuple: PartialPermissionTuple,
  oldRelations: string[],
  newRelations: string[]
) => {
  deleteRelationsForTuple(partialTuple, oldRelations)
  createRelationsForTuple(partialTuple, newRelations)
}

export const check = async (tuple: PermissionTuple) => {
  const [bucket, ..._] = tuple.object.split('/')
  if (bucket === tuple.subject) {
    return
  }
  const permissions = await getPermissions(tuple.object)
  for (const permission of permissions) {
    if (permission === tuple) {
      return
    }
  }
  throw new UnauthorizedException()
}
