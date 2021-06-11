import { DataTypes, Model, Optional } from 'sequelize'

import sequelize from '../db'

interface ConnectionAttributes {
  path: string
  connection_type: string
  connection_id: string
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface UserCreationAttributes
  extends Optional<ConnectionAttributes, 'path'> {}

class ConnectionModel
  extends Model<ConnectionAttributes, UserCreationAttributes>
  implements ConnectionAttributes
{
  public path!: string
  public connection_type!: string
  public connection_id!: string
}

export const init = async () => {
  ConnectionModel.init(
    {
      path: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      connection_type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      connection_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: 'connections',
      sequelize,
    }
  )
}

export default ConnectionModel
