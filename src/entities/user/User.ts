import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable
} from 'typeorm'
import { BaseEntity } from '../base/BaseEntity'
import { Employee } from '../employee/Employee'
import { Role } from '../role/Role'

@Entity('user')
export class User extends BaseEntity {
  @Column({ type: 'text', unique: true })
  username!: string

  @Column({ type: 'text' })
  password!: string

  @Column({ type: 'boolean', default: false })
  shouldResetPassword!: boolean

  @Column({ type: 'text' })
  salt!: string

  @ManyToMany(() => Role, { eager: true })
  @JoinTable({
    name: 'user_role',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' }
  })
  roles: Role[] = []

  @ManyToOne(() => Employee, { eager: true, nullable: false })
  @JoinColumn({ name: 'employee_id' })
  employee!: Employee

  // Campos "flattened"
  name?: string
  surname?: string
  nuit?: number
  email?: string
  phoneNumber?: string
  roleDescription?: string
  healthFacilityName?: string

  constructor(init?: Partial<User>) {
    super()
    if (init) {
      Object.assign(this, init)

      if (init.employee && !(init.employee instanceof Employee)) {
        this.employee = new Employee(init.employee)
      }

      if (init.roles) {
        this.roles = init.roles.map(role => role instanceof Role ? role : new Role(role))
      }
    }
  }

  static fromDTO(dto: any): User {
    const entity = new User()
    entity.updateBaseFieldsFromDTO(dto)

    entity.username = dto.username
    entity.password = dto.password
    entity.shouldResetPassword = dto.shouldResetPassword ?? false
    entity.salt = dto.salt

    entity.roles = (dto.userRoleDTOS || [])
      .map((ur: any) => ur.roleDTO ? Role.fromDTO(ur.roleDTO) : null)
      .filter((r: Role | null): r is Role => !!r)

    const employeeDTO = dto.employeeDTO || dto.employee
    entity.employee = employeeDTO instanceof Employee ? employeeDTO : Employee.fromDTO(employeeDTO)

    // Campos flatten
    entity.name = `${employeeDTO?.name ?? ''} ${employeeDTO?.surname ?? ''}`.trim()
    entity.surname = employeeDTO?.surname ?? null
    entity.nuit = employeeDTO?.nuit ?? null
    entity.email = employeeDTO?.email ?? null
    entity.phoneNumber = employeeDTO?.phoneNumber ?? null
    entity.roleDescription = (dto.userRoleDTOS || [])
      .map((r: any) => {
        const desc = r.roleDTO?.description;
        const level = r.roleDTO?.level;
        return desc && level ? `${desc} (${level})` : desc || null;
      })
      .filter(Boolean)
      .join(', ') || 'Sem perfil';


    const location = employeeDTO?.locationDTOSet?.[0]
    entity.healthFacilityName = location?.healthFacilityDTO?.designation ?? null

    return entity
  }

  toDTO(): any {
    return {
      ...this.getBaseDTO(),
      username: this.username?.trim() || null,
      password: this.password,
      shouldResetPassword: this.shouldResetPassword,
      salt: this.salt,
      userRoleDTOS: (this.roles || [])
        .map(r => {
          const role = r instanceof Role ? r : Role.fromDTO(r?.roleDTO || r)
          return { roleDTO: role.toDTO() }
        }),
      employeeDTO: {
        ...(this.employee?.toDTO?.() ?? {}),
        // name: this.name ?? null,
        // surname: this.surname ?? null,
        // nuit: this.nuit ?? null,
        // email: this.email ?? null,
        // phoneNumber: this.phoneNumber ?? null
      }
    }
  }


}
