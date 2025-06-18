import { defineStore } from 'pinia'
import ProfessionalCategoryService from 'src/services/professionalCategory/professionalCategoryService'
import { ProfessionalCategory } from 'src/entities/professionalCategory/ProfessionalCategoty'
import { replaceOrInsert } from 'src/utils/storeUtils'
import { paginateArray, flattenPages } from 'src/utils/paginationUtils'

export const useProfessionalCategoryStore = defineStore('professionalCategory', {
  state: () => ({
    categoriesPages: {} as Record<number, ProfessionalCategory[]>,
    currentPageCategories: [] as ProfessionalCategory[],
    currentCategory: null as ProfessionalCategory | null,
    loading: false,
    error: null as string | null,
    pagination: {
      totalSize: 0,
      totalPages: 0,
      currentPage: 0,
      pageSize: 10
    }
  }),

  actions: {
    async fetchCategories(params: {
      page?: number
      size?: number
      sort?: string
      name?: string
      ignoreCache?: boolean
      [key: string]: any
    } = {}) {
      const name = params.name ?? ''
      const ignoreCache = params.ignoreCache ?? false
      const isSearch = name.trim() !== ''
      const usePagination = params.page !== undefined || params.size !== undefined
      const useCache = !ignoreCache && !isSearch && usePagination

      const defaultSize = this.pagination.pageSize
      const page = params.page ?? 0
      const size = params.size ?? defaultSize

      if (useCache && this.categoriesPages[page]) {
        this.currentPageCategories = this.categoriesPages[page]
        this.pagination.currentPage = page
        return
      }

      this.loading = true
      this.error = null

      try {
        const response = await ProfessionalCategoryService.getAll({ ...params })
        const categories = (response.content ?? []).map((dto: any) =>
          ProfessionalCategory.fromDTO(dto)
        )

        if (!usePagination) {
          const paged = paginateArray(categories, defaultSize)
          this.categoriesPages = paged
          this.currentPageCategories = paged[0] ?? []
          this.pagination = {
            totalSize: categories.length,
            totalPages: Object.keys(paged).length,
            currentPage: 0,
            pageSize: defaultSize
          }
        } else {
          this.categoriesPages[page] = categories
          this.currentPageCategories = categories
          this.pagination = {
            totalSize: response.total,
            totalPages: Math.ceil(response.total / size),
            currentPage: response.page,
            pageSize: response.size
          }
        }
      } catch (error: any) {
        this.error = 'Erro ao buscar categorias profissionais'
        console.error(error)
      } finally {
        this.loading = false
      }
    },

    getAllCategoriesAcrossPages(): ProfessionalCategory[] {
      return flattenPages(this.categoriesPages)
    },

    async getCategoryDetails(id: number) {
      this.loading = true
      this.error = null
      try {
        const dto = await ProfessionalCategoryService.getById(id)
        this.currentCategory = ProfessionalCategory.fromDTO(dto)
      } catch (error: any) {
        this.error = 'Erro ao buscar detalhes da categoria profissional'
        console.error(error)
      } finally {
        this.loading = false
      }
    },

    async saveCategory(categoryData: Partial<ProfessionalCategory>) {
      this.error = null

      try {
        const category = categoryData instanceof ProfessionalCategory
          ? categoryData
          : new ProfessionalCategory(categoryData)

        const dtoToSend = category.toDTO()

        const savedDto = dtoToSend.id
          ? await ProfessionalCategoryService.update(dtoToSend)
          : await ProfessionalCategoryService.save(dtoToSend)

        const saved = ProfessionalCategory.fromDTO(savedDto)
        const page = this.pagination.currentPage

        if (!this.categoriesPages[page]) {
          this.categoriesPages[page] = []
        }

        this.categoriesPages[page] = replaceOrInsert(this.categoriesPages[page], saved, 'description')

        this.currentPageCategories = [...this.categoriesPages[page]]
        this.currentCategory = saved

        return saved
      } catch (error: any) {
        this.error = 'Erro ao salvar categoria profissional'
        console.error('Erro ao salvar categoria profissional:', error.response?.data || error.message || error)
        throw error
      }
    },

    async updateCategoryLifeCycleStatus(uuid: string, lifeCycleStatus: string) {
      this.error = null
      try {
        const updatedDto = await ProfessionalCategoryService.updateLifeCycleStatus(uuid, lifeCycleStatus)
        const updatedCategory = ProfessionalCategory.fromDTO(updatedDto)

        for (const page in this.categoriesPages) {
          const index = this.categoriesPages[page].findIndex(c => c.uuid === uuid)
          if (index !== -1) {
            this.categoriesPages[page][index] = updatedCategory
          }
        }

        this.currentPageCategories = this.categoriesPages[this.pagination.currentPage] ?? []

        if (this.currentCategory?.uuid === uuid) {
          this.currentCategory = updatedCategory
        }

        return updatedCategory
      } catch (error: any) {
        this.error = 'Erro ao atualizar status da categoria profissional'
        console.error(error)
        throw error
      }
    },

    async deleteCategory(uuid: string) {
      this.error = null
      try {
        await ProfessionalCategoryService.delete(uuid)

        for (const page in this.categoriesPages) {
          this.categoriesPages[page] = this.categoriesPages[page].filter(
            (c) => c.uuid !== uuid
          )
        }

        this.currentPageCategories = this.categoriesPages[this.pagination.currentPage] ?? []

        if (this.currentCategory?.uuid === uuid) {
          this.currentCategory = null
        }
      } catch (error: any) {
        const apiMessage =
          error?.response?.data?.message || 'Erro ao apagar categoria profissional'
        this.error = apiMessage
        console.error(error)
        throw error
      }
    }
  }
})
