import { Sequelize } from 'sequelize-typescript'

import Connection from './models/Connection.model'
import SharingStatus from './models/SharingStatus.model'

const connection = new Sequelize(process.env.DB_CONNECTION_STRING as string)

const initializeDb = async () => {
  try {
    await connection.authenticate()
    console.log('Database connection has been established successfully.')
  } catch (error) {
    console.error('Unable to connect to the database:', error)
  }
  connection.addModels([SharingStatus, Connection])
  connection.sync()
  console.log('running migrations')
  console.log('Migrations completed successfully')
}

initializeDb()

export default connection
