import { defineStore } from 'pinia'
import districtService from 'src/services/district/districtService'
import { District } from 'src/entities/district/District'
import { paginateArray, flattenPages } from 'src/utils/paginationUtils'

export const useDistrictStore = defineStore('district', {
  state: () => ({
    districtPages: {} as Record<number, District[]>,
    currentPageDistricts: [] as District[],
    currentDistrict: null as District | null,
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
    async fetchDistricts(params: { page?: number; size?: number } = {}) {
      const usePagination = params.page !== undefined || params.size !== undefined
      const defaultSize = this.pagination.pageSize
      const page = params.page ?? 0
      const size = params.size ?? defaultSize

      this.loading = true
      this.error = null

      try {
        const response = await districtService.getAll({ ...params })
        const districts = (response.content ?? []).map((dto: any) =>
          District.fromDTO(dto)
        )

        if (!usePagination) {
          const paged = paginateArray(districts, defaultSize)
          this.districtPages = paged
          this.currentPageDistricts = paged[0] ?? []
          this.pagination = {
            totalSize: districts.length,
            totalPages: Object.keys(paged).length,
            currentPage: 0,
            pageSize: defaultSize
          }
        } else {
          this.districtPages[page] = districts
          this.currentPageDistricts = districts
          this.pagination = {
            totalSize: response.total,
            totalPages: Math.ceil(response.total / size),
            currentPage: response.page,
            pageSize: response.size
          }
        }
      } catch (err: any) {
        this.error = 'Erro ao buscar distritos'
        console.error(err)
      } finally {
        this.loading = false
      }
    },

    getAllDistrictsAcrossPages(): District[] {
      return flattenPages(this.districtPages)
    }
  }
})
