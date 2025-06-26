import { defineStore } from 'pinia'
import roleService from 'src/services/role/roleService'

export const useRoleStore = defineStore('roleStore', {
  state: () => ({
    roles: [] as any[],
    loading: false
  }),

  actions: {
    async fetchAllRoles() {
      this.loading = true
      try {
        this.roles = await roleService.getAll()
      } finally {
        this.loading = false
      }
    },

    getRoleByCode(code: string) {
      return this.roles.find(r => r.code === code)
    },

    getAllRolesAcrossPages() {
      return this.roles
    }
  }
})