import axios from 'axios'

const client = axios.create({
  baseURL: 'http://localhost:4467/',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

interface KetoRelation {
  namespace: string
  object: string
  relation: string
  subject: string
}

export const createRelationTuple = async (relation: KetoRelation) => {
  await client.put('relation-tuples', relation)
}
