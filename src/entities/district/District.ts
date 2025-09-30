import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm'
import { BaseEntity } from '../base/BaseEntity'
import { Province } from '../province/Province'

@Entity('district')
export class District extends BaseEntity {
  @Column({ type: 'text', nullable: false })
  description!: string

  @ManyToOne(() => Province)
  @JoinColumn({ name: 'province_id' })
  province!: Province

  constructor(init?: Partial<District>) {
    super()
    if (init) {
      Object.assign(this, init)
    }
  }

  static fromDTO(dto: any): District {
    const entity = new District()

    entity.updateBaseFieldsFromDTO(dto)

    entity.description = dto.description

    // provinceDTO → relacionamento
    if (dto.provinceDTO) {
      entity.province = Province.fromDTO(dto.provinceDTO)
    }

    return entity
  }

  toDTO(): any {
    return {
      ...this.getBaseDTO(),
      description: this.description?.trim() || null,
      provinceDTO: this.province ? this.province.toDTO() : null
    }
  }
}
