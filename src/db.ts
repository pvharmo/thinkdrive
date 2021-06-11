import { Sequelize } from 'sequelize'

import { init as initConnectionModel } from './connections/connections.repository'
import runMigrations from './migrations/migration'

const sequelize = new Sequelize(process.env.DB_CONNECTION_STRING as string)

const initializeDb = async () => {
  try {
    await sequelize.authenticate()
    console.log('Database connection has been established successfully.')
  } catch (error) {
    console.error('Unable to connect to the database:', error)
  }
  await initConnectionModel()
  console.log('running migrations')
  try {
    await runMigrations()
  } catch {
    console.error('An error has occurred while running migrations')
  }
  console.log('Migrations completed successfully')
}

initializeDb()

export default sequelize
