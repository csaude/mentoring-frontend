import { Entity, Column } from 'typeorm'
import { BaseEntity } from '../base/BaseEntity'

@Entity('program')
export class Program extends BaseEntity {
  @Column({ type: 'text' })
  name!: string

  @Column({ type: 'text', nullable: false })
  description!: string | null

  @Column({ type: 'text', nullable: false })
  code!: string | null

  constructor(init?: Partial<Program>) {
    super()
    if (init) {
      Object.assign(this, init)
    }
  }

  static fromDTO(dto: any): Program {
    const entity = new Program()

    // Evita repetição
    entity.updateBaseFieldsFromDTO(dto)

    // Campos específicos do Program
    entity.name = dto.name
    entity.description = dto.description ?? null
    entity.code = dto.code ?? null

    return entity
  }

  toDTO(): any {
    return {
      ...this.getBaseDTO(), // Evita repetição
      name: this.name,
      description: this.description?.trim() || null,
      code: this.code?.trim() || null
    }
  }
}
