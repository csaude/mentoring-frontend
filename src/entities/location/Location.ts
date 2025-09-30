import { BaseEntity } from '../base/BaseEntity'
import { Province } from '../province/Province'
import { District } from '../district/District'
import { HealthFacility } from '../healthFacility/HealthFacility'
import { Entity, ManyToOne, JoinColumn } from 'typeorm'
import { Employee } from '../employee/Employee'

@Entity('location')
export class Location extends BaseEntity {
  @ManyToOne(() => Province, { eager: true })
  @JoinColumn()
  province!: Province

  @ManyToOne(() => District, { eager: true })
  @JoinColumn()
  district!: District

  @ManyToOne(() => HealthFacility, { eager: true })
  @JoinColumn()
  healthFacility!: HealthFacility

  @ManyToOne(() => Employee, (employee) => employee.locations)
  employee!: Employee

  constructor(init?: Partial<Location>) {
    super()
    if (init) {
      Object.assign(this, init)

      if (init.province && !(init.province instanceof Province)) {
        this.province = new Province(init.province)
      }

      if (init.district && !(init.district instanceof District)) {
        this.district = new District(init.district)
      }

      if (init.healthFacility && !(init.healthFacility instanceof HealthFacility)) {
        this.healthFacility = new HealthFacility(init.healthFacility)
      }
    }
  }

  static fromDTO(dto: any): Location {
    const entity = new Location()

    entity.updateBaseFieldsFromDTO(dto)

    entity.province = dto.provinceDTO
      ? new Province(dto.provinceDTO)
      : new Province(dto.province)

    entity.district = dto.districtDTO
      ? new District(dto.districtDTO)
      : new District(dto.district)

    entity.healthFacility = dto.healthFacilityDTO
      ? new HealthFacility(dto.healthFacilityDTO)
      : new HealthFacility(dto.healthFacility)

    return entity
  }

  toDTO(): any {
    return {
      ...this.getBaseDTO(),
      provinceDTO: this.province?.toDTO(),
      districtDTO: this.district?.toDTO(),
      healthFacilityDTO: this.healthFacility?.toDTO()
    }
  }
}
