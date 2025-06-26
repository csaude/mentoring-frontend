import { BaseEntity } from '../base/BaseEntity'
import { Location } from '../location/Location'
import { Partner } from '../partner/Partner'
import { ProfessionalCategory } from '../professionalCategory/ProfessionalCategoty'
import { Entity, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm'

@Entity('employee')
export class Employee extends BaseEntity {
  @Column({ type: 'text' })
  name!: string

  @Column({ type: 'text' })
  surname!: string

  @Column({ type: 'bigint', nullable: true })
  nuit?: number

  @Column({ type: 'int', nullable: true })
  trainingYear?: number

  @Column({ type: 'text', nullable: true })
  phoneNumber?: string

  @Column({ type: 'text', nullable: true })
  email?: string

  @ManyToOne(() => Partner, { eager: true })
  @JoinColumn()
  partner?: Partner

  @ManyToOne(() => ProfessionalCategory, { eager: true })
  @JoinColumn()
  professionalCategory?: ProfessionalCategory

  @OneToMany(() => Location, (location) => location.employee, { cascade: true, eager: true })
  locations!: Location[]

  constructor(init?: Partial<Employee>) {
    super()
    if (init) {
      Object.assign(this, init)

      // Garante que partner e professionalCategory sejam instâncias válidas
      if (init.partner && !(init.partner instanceof Partner)) {
        this.partner = new Partner(init.partner)
      }

      if (init.professionalCategory && !(init.professionalCategory instanceof ProfessionalCategory)) {
        this.professionalCategory = new ProfessionalCategory(init.professionalCategory)
      }

      if (init.locations) {
        this.locations = init.locations.map((loc) =>
          loc instanceof Location ? loc : new Location(loc)
        )
      }
    }
  }

  static fromDTO(dto: any): Employee {
    const entity = new Employee()

    entity.updateBaseFieldsFromDTO(dto)

    entity.name = dto.name
    entity.surname = dto.surname
    entity.nuit = dto.nuit
    entity.trainingYear = dto.trainingYear
    entity.phoneNumber = dto.phoneNumber
    entity.email = dto.email

    entity.partner = dto.partnerDTO
      ? Partner.fromDTO(dto.partnerDTO)
      : dto.partner
        ? new Partner(dto.partner)
        : undefined

    entity.professionalCategory = dto.professionalCategoryDTO
      ? ProfessionalCategory.fromDTO(dto.professionalCategoryDTO)
      : dto.professionalCategory
        ? new ProfessionalCategory(dto.professionalCategory)
        : undefined

    entity.locations = (dto.locationDTOSet || dto.locations || []).map((l: any) =>
      Location.fromDTO(l)
    )

    return entity
  }

  toDTO(): any {
    return {
      ...this.getBaseDTO(),
      name: this.name,
      surname: this.surname,
      nuit: this.nuit,
      trainingYear: this.trainingYear,
      phoneNumber: this.phoneNumber,
      email: this.email,
      partnerDTO: this.partner?.toDTO(),
      professionalCategoryDTO: this.professionalCategory?.toDTO(),
      locationDTOSet: this.locations?.map((l) => l.toDTO()) || []
    }
  }
}
