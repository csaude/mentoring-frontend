import { Entity, Column } from 'typeorm'
import { BaseEntity } from '../base/BaseEntity'

@Entity('province')
export class Province extends BaseEntity {
  @Column({ type: 'text', nullable: false })
  designation!: string

  constructor(init?: Partial<Province>) {
    super()
    if (init) {
      Object.assign(this, init)
    }
  }

  static fromDTO(dto: any): Province {
    const entity = new Province()

    entity.updateBaseFieldsFromDTO(dto)

    entity.designation = dto.designation

    return entity
  }

  toDTO(): any {
    return {
      ...this.getBaseDTO(),
      designation: this.designation?.trim() || null
    }
  }
}
