import ConnectionModel from '../connections/connections.repository'

const run = async () => {
  ConnectionModel.sync()
}

export default run
