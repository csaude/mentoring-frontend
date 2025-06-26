import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm'
import { BaseEntity } from '../base/BaseEntity'
import { District } from '../district/District'

@Entity('health_facility')
export class HealthFacility extends BaseEntity {
  @Column({ type: 'text', nullable: false })
  healthFacility!: string

  @ManyToOne(() => District)
  @JoinColumn({ name: 'district_id' })
  district!: District

  constructor(init?: Partial<HealthFacility>) {
    super()
    if (init) {
      Object.assign(this, init)
    }
  }

  static fromDTO(dto: any): HealthFacility {
    const entity = new HealthFacility()

    entity.updateBaseFieldsFromDTO(dto)

    entity.healthFacility = dto.healthFacility

    // districtDTO → relacionamento
    if (dto.districtDTO) {
      entity.district = District.fromDTO(dto.districtDTO)
    }

    return entity
  }

  toDTO(): any {
    return {
      ...this.getBaseDTO(),
      healthFacility: this.healthFacility?.trim() || null,
      districtDTO: this.district ? this.district.toDTO() : null
    }
  }
}
