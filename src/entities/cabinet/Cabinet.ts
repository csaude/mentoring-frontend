import { Entity, Column } from 'typeorm'
import { BaseEntity } from '../base/BaseEntity'

@Entity('cabinet')
export class Cabinet extends BaseEntity {
  @Column({ type: 'text', nullable: false })
  name!: string

  constructor(init?: Partial<Cabinet>) {
    super()
    if (init) Object.assign(this, init)
  }

  static fromDTO(dto: any): Cabinet {
    const entity = new Cabinet()
    // Campos base (id, uuid, createdAt, updatedAt, lifeCycleStatus, etc.)
    entity.updateBaseFieldsFromDTO(dto)

    // Campos específicos de Cabinet
    entity.name = dto.name

    return entity
  }

  toDTO(): any {
    return {
      ...this.getBaseDTO(),
      name: this.name?.trim()
    }
  }
}
