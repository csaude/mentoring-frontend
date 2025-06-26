import { Entity, Column } from 'typeorm'
import { BaseEntity } from '../base/BaseEntity'

@Entity('authority')
export class Authority extends BaseEntity {
  @Column({ type: 'text' })
  code!: string

  @Column({ type: 'text' })
  module!: string

  @Column({ type: 'text' })
  description!: string

  constructor(init?: Partial<Authority>) {
    super()
    Object.assign(this, init)
  }

  static fromDTO(dto: any): Authority {
    const entity = new Authority()
    entity.updateBaseFieldsFromDTO(dto)
    entity.code = dto.code
    entity.module = dto.module
    entity.description = dto.description
    return entity
  }

  toDTO(): any {
    return {
      ...this.getBaseDTO(),
      code: this.code,
      module: this.module,
      description: this.description
    }
  }
}