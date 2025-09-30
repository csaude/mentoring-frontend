import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm'
import { BaseEntity } from '../base/BaseEntity'
import { Program } from '../program/Program'

@Entity('questions')
export class Question extends BaseEntity {
  @Column({ type: 'text', nullable: false })
  code!: string

  @Column({ type: 'text', nullable: true })
  tableCode?: string

  @Column({ type: 'text', nullable: false })
  question!: string

  @Column({ type: 'boolean', default: false })
  usedInFormSection!: boolean

  @ManyToOne(() => Program)
  @JoinColumn({ name: 'program_id' })
  program!: Program

  constructor(init?: Partial<Question>) {
    super()
    if (init) {
      Object.assign(this, init)
    }
  }

  static fromDTO(dto: any): Question {
    const entity = new Question()

    entity.updateBaseFieldsFromDTO(dto)

    entity.code = dto.code
    entity.tableCode = dto.tableCode ?? null
    entity.question = dto.question
    entity.usedInFormSection = dto.used_in_form_section ?? false

    // Program (relacionamento)
    if (dto.program) {
      entity.program = Program.fromDTO(dto.program)
    }

    return entity
  }

  toDTO(): any {
    return {
      ...this.getBaseDTO(),
      code: this.code?.trim() || null,
      tableCode: this.tableCode?.trim() || null,
      question: this.question?.trim() || null,
      used_in_form_section: this.usedInFormSection,
      program: this.program ? this.program.toDTO() : null,
      programUuid: this.program?.uuid ?? null
    }
  }
}
