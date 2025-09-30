import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm'
import { BaseEntity } from '../base/BaseEntity'
import { Program } from '../program/Program'

@Entity('programmatic_area')
export class ProgrammaticArea extends BaseEntity {
  @Column({ type: 'text', nullable: false })
  code!: string

  @Column({ type: 'text', nullable: false })
  description!: string

  @Column({ type: 'text', nullable: false })
  name!: string

  @ManyToOne(() => Program)
  @JoinColumn({ name: 'program_id' })
  program!: Program

  constructor(init?: Partial<ProgrammaticArea>) {
    super()
    if (init) {
      Object.assign(this, init)
    }
  }

  static fromDTO(dto: any): ProgrammaticArea {
    const entity = new ProgrammaticArea()

    entity.updateBaseFieldsFromDTO(dto)

    entity.code = dto.code
    entity.description = dto.description
    entity.name = dto.name

    // Program (relacionamento) — cuidado com casos onde dto.program pode ser null
    if (dto.program) {
      entity.program = Program.fromDTO(dto.program)
    }

    return entity
  }

  toDTO(): any {
    return {
      ...this.getBaseDTO(),
      code: this.code?.trim() || null,
      description: this.description?.trim() || null,
      name: this.name?.trim() || null,
      program: this.program ? this.program.toDTO() : null
    }
  }
}
