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

interface ObjectPermissions {
  permissions: PermissionTuple[]
}

const permissionsPath = (path: string) => {
  const [bucket, ...bucketPath] = path.split('/')
  return {
    bucket,
    bucketPath: '/' + bucketPath.join('/') + '.__permissions',
  }
}

const getPermissions = async (path: string): Promise<ObjectPermissions> => {
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
  permissions: ObjectPermissions
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
  permissions.permissions.push(tuple)
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
    permissions.permissions.push(tuple)
  }

  savePermissions(partialTuple.object, permissions)
}

export const deleteRelationTuple = async (tuple: PermissionTuple) => {
  const permissions = await getPermissions(tuple.object)
  const newPermissions = permissions.permissions.filter((x) => x != tuple)
  permissions.permissions = newPermissions
  savePermissions(tuple.object, permissions)
}

export const deleteAllSubjectFromRelation = async (
  tuple: PermissionTupleWithoutSubject
) => {
  const permissions = await getPermissions(tuple.object)
  const newPermissions = permissions.permissions.filter((x) => {
    return x.namespace !== tuple.namespace && x.relation !== tuple.relation
  })
  permissions.permissions = newPermissions
  savePermissions(tuple.object, permissions)
}

export const deleteRelationsForTuple = async (
  partialTuple: PartialPermissionTuple,
  relations: string[]
) => {
  const newPermissions = []
  const permissions = await getPermissions(partialTuple.object)
  for (const relation in relations) {
    for (const permission of permissions.permissions) {
      if (permission.relation !== relation) {
        newPermissions.push(permission)
      }
    }
  }
  permissions.permissions = newPermissions
  savePermissions(partialTuple.object, permissions)
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
  const permissions = await findPermissions(tuple.object)
  for (const permission of permissions.permissions) {
    if (
      permission.namespace === tuple.namespace &&
      // permission.object === tuple.object &&
      permission.relation === tuple.relation &&
      permission.subject === tuple.subject
    ) {
      return
    }
  }
  throw new UnauthorizedException()
}

const findPermissions = async (path: string) => {
  let pathArray = path.split('/')

  while (pathArray.length > 0) {
    try {
      const permissions = await getPermissions(pathArray.join('/'))
      return permissions
    } catch (error) {
      console.log(error)
      pathArray = pathArray.slice(0, -1)
    }
  }
  throw new UnauthorizedException()
}
