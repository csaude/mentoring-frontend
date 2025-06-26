import { Entity, Column } from 'typeorm'
import { BaseEntity } from '../base/BaseEntity'

@Entity('partner')
export class Partner extends BaseEntity {
  @Column({ type: 'text', nullable: false })
  name!: string

  @Column({ type: 'text', nullable: false })
  description!: string

  constructor(init?: Partial<Partner>) {
    super()
    if (init) {
      Object.assign(this, init)
    }
  }

  static fromDTO(dto: any): Partner {
    const entity = new Partner()

    entity.updateBaseFieldsFromDTO(dto)

    entity.name = dto.name
    entity.description = dto.description

    return entity
  }

  toDTO(): any {
    return {
      ...this.getBaseDTO(),
      name: this.name?.trim() || null,
      description: this.description?.trim() || null
    }
  }
}
