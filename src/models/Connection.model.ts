import { DataTypes } from 'sequelize'
import { Table, Column, Model, Unique } from 'sequelize-typescript'

@Table
class Connection extends Model {
  @Unique
  @Column({ type: DataTypes.STRING })
  path!: string

  @Column({ type: DataTypes.STRING })
  connection_type!: string

  @Column({ type: DataTypes.STRING })
  connection_id!: string
}

export default Connection
