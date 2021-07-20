import { DataTypes } from 'sequelize'
import { Table, Column, Model, Unique } from 'sequelize-typescript'

import { SharingStatus as SharingStatusScopes } from '../connections/interfaces'

@Table
class SharingStatus extends Model {
  @Unique
  @Column({ type: DataTypes.STRING })
  path!: string

  @Column({ type: DataTypes.JSON })
  scopes!: SharingStatusScopes
}

export default SharingStatus
