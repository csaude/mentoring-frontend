import { Entity, Column, ManyToMany, JoinTable } from 'typeorm'
import { BaseEntity } from '../base/BaseEntity'
import { Authority } from '../authority/Authority'

@Entity('role')
export class Role extends BaseEntity {
  @Column({ type: 'text' })
  code!: string

  @Column({ type: 'text' })
  description!: string

  @Column({ type: 'text' })
  level!: string

  @Column({ type: 'int' })
  hierarchyLevel!: number

  @ManyToMany(() => Authority, { cascade: true, eager: true })
  @JoinTable({ name: 'role_authority' })
  authorities!: Authority[]

  constructor(init?: Partial<Role>) {
    super()
    Object.assign(this, init)
  }

  static fromDTO(dto: any): Role {
    const entity = new Role()
    entity.updateBaseFieldsFromDTO(dto)
    entity.code = dto.code
    entity.description = dto.description
    entity.level = dto.level
    entity.hierarchyLevel = dto.hierarchyLevel
    entity.authorities = dto.roleAuthorityDTOS?.map((ra: any) => Authority.fromDTO(ra.authorityDTO)) || []
    return entity
  }

  toDTO(): any {
    return {
      ...this.getBaseDTO(),
      code: this.code,
      description: this.description,
      level: this.level,
      hierarchyLevel: this.hierarchyLevel,
      roleAuthorityDTOS: this.authorities.map(authority => ({ authorityDTO: authority.toDTO() }))
    }
  }
}