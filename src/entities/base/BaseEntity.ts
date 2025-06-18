import { PrimaryGeneratedColumn, Column } from 'typeorm'

export abstract class BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: 'text', unique: true })
  uuid!: string

  @Column({ type: 'text' })
  createdBy!: string

  @Column({ type: 'timestamp' })
  createdAt!: Date

  @Column({ type: 'text', nullable: true })
  updatedBy?: string

  @Column({ type: 'timestamp', nullable: true })
  updatedAt?: Date

  @Column({ type: 'text' })
  lifeCycleStatus!: string

  // Evita repetição no fromDTO
  updateBaseFieldsFromDTO(dto: any): void {
    if (dto.id !== undefined) this.id = dto.id
    if (dto.uuid !== undefined) this.uuid = dto.uuid
    if (dto.createdBy !== undefined) this.createdBy = dto.createdBy
    if (dto.createdAt !== undefined) this.createdAt = new Date(dto.createdAt)
    if (dto.updatedBy !== undefined) this.updatedBy = dto.updatedBy
    if (dto.updatedAt !== undefined) this.updatedAt = new Date(dto.updatedAt)
    if (dto.lifeCycleStatus !== undefined) this.lifeCycleStatus = dto.lifeCycleStatus
  }

  // Evita repetição no toDTO
  getBaseDTO(): any {
    return {
      id: this.id,
      uuid: this.uuid,
      createdBy: this.createdBy,
      createdAt: this.createdAt?.toISOString() ?? null,
      updatedBy: this.updatedBy ?? null,
      updatedAt: this.updatedAt?.toISOString() ?? null,
      lifeCycleStatus: this.lifeCycleStatus
    }
  }
}
