import { DataTypes } from 'sequelize'
import { Table, Column, Model, Unique, AllowNull } from 'sequelize-typescript'

import { SharingStatus as SharingStatusScopes } from '../connections/interfaces'

@Table
class SharingStatus extends Model {
  @Unique
  @AllowNull(false)
  @Column({ type: DataTypes.STRING })
  path!: string

  @AllowNull(false)
  @Column({ type: DataTypes.JSON })
  scopes!: SharingStatusScopes
}

export default SharingStatus
