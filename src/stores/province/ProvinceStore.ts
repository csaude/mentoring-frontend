import { defineStore } from 'pinia'
import provinceService from 'src/services/province/provinceService'
import { Province } from 'src/entities/province/Province'
import { paginateArray, flattenPages } from 'src/utils/paginationUtils'

export const useProvinceStore = defineStore('province', {
  state: () => ({
    provincePages: {} as Record<number, Province[]>,
    currentPageProvinces: [] as Province[],
    currentProvince: null as Province | null,
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
    async fetchProvinces(params: { page?: number; size?: number; ignoreCache?: boolean } = {}) {
      const defaultSize = this.pagination.pageSize
      const page = params.page ?? 0
      const size = params.size ?? defaultSize
      const ignoreCache = params.ignoreCache ?? false
      const usePagination = params.page !== undefined || params.size !== undefined

      if (!ignoreCache && usePagination && this.provincePages[page]) {
        this.currentPageProvinces = this.provincePages[page]
        this.pagination.currentPage = page
        return
      }

      this.loading = true
      this.error = null

      try {
        const response = await provinceService.getAll({ ...params, page, size })
        const provinces = (response.content ?? []).map((dto: any) => Province.fromDTO(dto))

        if (!usePagination) {
          const paged = paginateArray(provinces, defaultSize)
          this.provincePages = paged
          this.currentPageProvinces = paged[0] ?? []
          this.pagination = {
            totalSize: provinces.length,
            totalPages: Object.keys(paged).length,
            currentPage: 0,
            pageSize: defaultSize
          }
        } else {
          this.provincePages[page] = provinces
          this.currentPageProvinces = provinces
          this.pagination = {
            totalSize: response.total,
            totalPages: Math.ceil(response.total / size),
            currentPage: response.page,
            pageSize: response.size
          }
        }
      } catch (err: any) {
        this.error = 'Erro ao buscar províncias'
        console.error(err)
      } finally {
        this.loading = false
      }
    },

    getAllProvincesAcrossPages(): Province[] {
      return flattenPages(this.provincePages)
    }
  }
})
