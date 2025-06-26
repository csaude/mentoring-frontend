import { defineStore } from 'pinia'
import { replaceOrInsert } from 'src/utils/storeUtils'
import { paginateArray, flattenPages } from 'src/utils/paginationUtils'
import { Location } from 'src/entities/location/Location'
import LocationService from 'src/services/location/LocationService'

export const useLocationStore = defineStore('location', {
  state: () => ({
    locationsPages: {} as Record<number, Location[]>,
    currentPageLocations: [] as Location[],
    currentLocation: null as Location | null,
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
    async fetchLocations(params: any = {}) {
      const defaultSize = this.pagination.pageSize
      const page = params.page ?? 0
      const size = params.size ?? defaultSize
      const ignoreCache = params.ignoreCache ?? false
      const useCache = !ignoreCache && this.locationsPages[page]

      if (useCache) {
        this.currentPageLocations = this.locationsPages[page]
        this.pagination.currentPage = page
        return
      }

      this.loading = true
      this.error = null

      try {
        const response = await LocationService.getAll(params)
        const locations = (response.content ?? []).map((dto: any) => Location.fromDTO(dto))

        this.locationsPages[page] = locations
        this.currentPageLocations = locations
        this.pagination = {
          totalSize: response.total,
          totalPages: Math.ceil(response.total / size),
          currentPage: response.page,
          pageSize: response.size
        }
      } catch (error: any) {
        this.error = 'Erro ao buscar localizações'
        console.error(error)
      } finally {
        this.loading = false
      }
    },

    getAllLocationsAcrossPages(): Location[] {
      return flattenPages(this.locationsPages)
    },

    async saveLocation(data: Partial<Location>) {
      this.error = null
      try {
        const location = data instanceof Location ? data : new Location(data)
        const dto = location.toDTO()

        const savedDto = dto.id
          ? await LocationService.update(dto)
          : await LocationService.save(dto)

        const saved = Location.fromDTO(savedDto)
        const page = this.pagination.currentPage

        if (!this.locationsPages[page]) {
          this.locationsPages[page] = []
        }

        this.locationsPages[page] = replaceOrInsert(this.locationsPages[page], saved, 'uuid')
        this.currentPageLocations = [...this.locationsPages[page]]
        this.currentLocation = saved

        return saved
      } catch (error: any) {
        this.error = 'Erro ao salvar localização'
        console.error(error)
        throw error
      }
    }
  }
})