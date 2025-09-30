import { defineStore } from 'pinia'
import CabinetService from 'src/services/cabinet/cabinetService'
import { Cabinet } from 'src/entities/cabinet/Cabinet'
import { replaceOrInsert } from 'src/utils/storeUtils'
import { paginateArray, flattenPages } from 'src/utils/paginationUtils'

export const useCabinetStore = defineStore('cabinet', {
  state: () => ({
    cabinetsPages: {} as Record<number, Cabinet[]>,
    currentPageCabinets: [] as Cabinet[],
    currentCabinet: null as Cabinet | null,
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
    async fetchCabinets(params: {
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

      if (useCache && this.cabinetsPages[page]) {
        this.currentPageCabinets = this.cabinetsPages[page]
        this.pagination.currentPage = page
        return
      }

      this.loading = true
      this.error = null

      try {
        const response = await CabinetService.getAll({ ...params })
        const cabinets = (response.content ?? []).map((dto: any) =>
          Cabinet.fromDTO(dto)
        )

        if (!usePagination) {
          const paged = paginateArray(cabinets, defaultSize)
          this.cabinetsPages = paged
          this.currentPageCabinets = paged[0] ?? []
          this.pagination = {
            totalSize: cabinets.length,
            totalPages: Object.keys(paged).length,
            currentPage: 0,
            pageSize: defaultSize
          }
        } else {
          this.cabinetsPages[page] = cabinets
          this.currentPageCabinets = cabinets
          this.pagination = {
            totalSize: response.total,
            totalPages: Math.ceil(response.total / size),
            currentPage: response.page,
            pageSize: response.size
          }
        }
      } catch (error: any) {
        this.error = 'Erro ao buscar gabinetes'
        console.error(error)
      } finally {
        this.loading = false
      }
    },

    getAllCabinetsAcrossPages(): Cabinet[] {
      return flattenPages(this.cabinetsPages)
    },

    async getCabinetDetails(id: number) {
      this.loading = true
      this.error = null
      try {
        const dto = await CabinetService.getById(id)
        this.currentCabinet = Cabinet.fromDTO(dto)
      } catch (error: any) {
        this.error = 'Erro ao buscar detalhes do gabinete'
        console.error(error)
      } finally {
        this.loading = false
      }
    },

    async saveCabinet(cabinetData: Partial<Cabinet>) {
      this.error = null
      try {
        const cabinet = cabinetData instanceof Cabinet
          ? cabinetData
          : new Cabinet(cabinetData)

        const dtoToSend = cabinet.toDTO()

        const savedDto = dtoToSend.id
          ? await CabinetService.update(dtoToSend)
          : await CabinetService.save(dtoToSend)

        const saved = Cabinet.fromDTO(savedDto)
        const page = this.pagination.currentPage

        if (!this.cabinetsPages[page]) {
          this.cabinetsPages[page] = []
        }

        this.cabinetsPages[page] = replaceOrInsert(this.cabinetsPages[page], saved, 'name')

        this.currentPageCabinets = [...this.cabinetsPages[page]]
        this.currentCabinet = saved

        return saved
      } catch (error: any) {
        this.error = 'Erro ao salvar gabinete'
        console.error('Erro ao salvar gabinete:', error?.response?.data || error.message || error)
        throw error
      }
    },

    async updateCabinetLifeCycleStatus(uuid: string, lifeCycleStatus: string) {
      this.error = null
      try {
        const updatedDto = await CabinetService.updateLifeCycleStatus(uuid, lifeCycleStatus)
        const updated = Cabinet.fromDTO(updatedDto)

        for (const page in this.cabinetsPages) {
          const index = this.cabinetsPages[page].findIndex(p => p.uuid === uuid)
          if (index !== -1) {
            this.cabinetsPages[page][index] = updated
          }
        }

        this.currentPageCabinets = this.cabinetsPages[this.pagination.currentPage] ?? []

        if (this.currentCabinet?.uuid === uuid) {
          this.currentCabinet = updated
        }

        return updated
      } catch (error: any) {
        this.error = 'Erro ao atualizar status do gabinete'
        console.error(error)
        throw error
      }
    },

    async deleteCabinet(uuid: string) {
      this.error = null
      try {
        await CabinetService.delete(uuid)

        for (const page in this.cabinetsPages) {
          this.cabinetsPages[page] = this.cabinetsPages[page].filter(
            (p) => p.uuid !== uuid
          )
        }

        this.currentPageCabinets = this.cabinetsPages[this.pagination.currentPage] ?? []

        if (this.currentCabinet?.uuid === uuid) {
          this.currentCabinet = null
        }
      } catch (error: any) {
        this.error = error?.response?.data?.message || 'Erro ao apagar gabinete'
        console.error(error)
        throw error
      }
    }
  }
})
