import { defineStore } from 'pinia'
import UserService from 'src/services/user/UserService'
import { replaceOrInsert } from 'src/utils/storeUtils'
import { paginateArray, flattenPages } from 'src/utils/paginationUtils'
import { User } from 'src/entities/user/User'

export const useUserStore = defineStore('user', {
  state: () => ({
    usersPages: {} as Record<number, User[]>,
    currentPageUsers: [] as User[],
    currentUser: null as User | null,
    loading: false,
    error: null as string | null,
    pagination: {
      totalSize: 0,
      totalPages: 0,
      currentPage: 0,
      pageSize: 100
    }
  }),

  actions: {
    async fetchUsers(params: any = {}) {
      const defaultSize = this.pagination.pageSize
      const page = params.page ?? 0
      const size = params.size ?? defaultSize
      const ignoreCache = params.ignoreCache ?? false

      const isSearch = params.query.trim() !== ''
      const useCache = !ignoreCache && !isSearch  && this.usersPages[page]

      // if (useCache) {
      //   this.currentPageUsers = this.usersPages[page]
      //   this.pagination.currentPage = page
      //   return
      // }

      this.loading = true
      this.error = null

      try {
        const queryParams = {
          query: params.query?.trim() || '',
          page,
          size
        }
        
        const response = await UserService.getAll(queryParams)
        const users = (response.content ?? []).map((dto: any) => User.fromDTO(dto))

        this.usersPages[page] = users
        this.currentPageUsers = users

        this.pagination = {
          totalSize: response.total,
          totalPages: Math.ceil(response.total / size),
          currentPage: response.page,
          pageSize: response.size
        }
      } catch (error: any) {
        this.error = 'Erro ao buscar utilizadores'
        console.error(error)
      } finally {
        this.loading = false
      }
    }
,


    getAllUsersAcrossPages(): User[] {
      return flattenPages(this.usersPages)
    },

    async saveUser(data: Partial<User>) {
      this.error = null
      try {
        const user = data instanceof User ? data : new User(data)
        console.log('Saving user:', user)
        const dto = user.toDTO()
        console.log('Saving user dto:', dto)
        const savedDto = dto.id
          ? await UserService.update(dto)
          : await UserService.save(dto)

        console.log('Saved user DTO:', savedDto)
       
        const saved = User.fromDTO(savedDto)
        const page = this.pagination.currentPage

        if (!this.usersPages[page]) {
          this.usersPages[page] = []
        }

        this.usersPages[page] = replaceOrInsert(this.usersPages[page], saved, 'username')
        this.currentPageUsers = [...this.usersPages[page]]
        this.currentUser = saved

        return saved
      } catch (error: any) {
        this.error = 'Erro ao salvar utilizador'
        console.error(error)
        throw error
      }
    },

    async updateUserLifeCycleStatus(uuid: string, lifeCycleStatus: string) {
  this.error = null
  try {
    const updatedDto = await UserService.updateLifeCycleStatus(uuid, lifeCycleStatus)
    const updatedUser = User.fromDTO(updatedDto)

    for (const page in this.usersPages) {
      const index = this.usersPages[page].findIndex(u => u.uuid === uuid)
      if (index !== -1) {
        this.usersPages[page][index] = updatedUser
      }
    }

    this.currentPageUsers = this.usersPages[this.pagination.currentPage] ?? []

    if (this.currentUser?.uuid === uuid) {
      this.currentUser = updatedUser
    }

    return updatedUser
  } catch (error: any) {
    this.error = 'Erro ao atualizar status do utilizador'
    console.error(error)
    throw error
  }
}

  }
})
