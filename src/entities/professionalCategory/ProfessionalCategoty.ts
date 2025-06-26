import { Entity, Column } from 'typeorm'
import { BaseEntity } from '../base/BaseEntity'

@Entity('professional_category')
export class ProfessionalCategory extends BaseEntity {
  @Column({ type: 'text', nullable: false })
  code!: string

  @Column({ type: 'text', nullable: false })
  description!: string

  constructor(init?: Partial<ProfessionalCategory>) {
    super()
    if (init) {
      Object.assign(this, init)
    }
  }

  static fromDTO(dto: any): ProfessionalCategory {
    const entity = new ProfessionalCategory()

    entity.updateBaseFieldsFromDTO(dto)

    entity.code = dto.code
    entity.description = dto.description

    return entity
  }

  toDTO(): any {
    return {
      ...this.getBaseDTO(),
      code: this.code?.trim() || null,
      description: this.description?.trim() || null
    }
  }
}
