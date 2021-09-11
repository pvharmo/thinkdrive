import axios from 'axios'

import UnauthorizedException from './UnauthorizedException'

const client = axios.create({
  baseURL: 'http://localhost:4467/',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

interface KetoTuple {
  namespace: string
  object: string
  relation: string
  subject: string
}

interface PartialKetoTuple {
  namespace: string
  object: string
  subject: string
}

interface KetoTupleWithoutSubject {
  namespace: string
  object: string
  relation: string
}

export const createRelationTuple = async (tuple: KetoTuple) => {
  await client.put('relation-tuples', tuple)
}

export const createRelationsForTuple = async (
  partialTuple: PartialKetoTuple,
  relations: string[]
) => {
  const promises = []
  for (const relation in relations) {
    const tuple = {
      namespace: partialTuple.namespace,
      object: partialTuple.object,
      subject: partialTuple.subject,
      relation: relation,
    }
    promises.push(createRelationTuple(tuple))
  }

  Promise.all(promises)
}

export const deleteRelationTuple = async (tuple: KetoTuple) => {
  await client.delete(
    `/relation-tuples?namespace=${tuple.namespace}&object=${tuple.object}&relation=${tuple.relation}&subject=${tuple.subject}`
  )
}

export const deleteAllSubjectFromRelation = async (
  tuple: KetoTupleWithoutSubject
) => {
  await client.delete(
    `/relation-tuples?namespace=${tuple.namespace}&object=${tuple.object}&relation=${tuple.relation}`
  )
}

export const deleteRelationsForTuple = async (
  partialTuple: PartialKetoTuple,
  relations: string[]
) => {
  const promises = []
  for (const relation in relations) {
    const tuple = {
      namespace: partialTuple.namespace,
      object: partialTuple.object,
      subject: partialTuple.subject,
      relation: relation,
    }
    promises.push(deleteRelationTuple(tuple))
  }

  Promise.all(promises)
}

export const updateRelationTuple = async (
  oldTuple: KetoTuple,
  newTuple: KetoTuple
) => {
  deleteRelationTuple(oldTuple)
  createRelationTuple(newTuple)
}

export const updateRelationsForTuple = async (
  partialTuple: PartialKetoTuple,
  oldRelations: string[],
  newRelations: string[]
) => {
  deleteRelationsForTuple(partialTuple, oldRelations)
  createRelationsForTuple(partialTuple, newRelations)
}

export const check = async (tuple: KetoTuple) => {
  const res = await client.post('check', tuple)
  if (res.status === 403) {
    throw new UnauthorizedException()
  }
}
