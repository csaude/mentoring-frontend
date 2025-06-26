import { defineStore } from 'pinia'
import ProgramService from 'src/services/program/programService'
import { Program } from 'src/entities/program/Program'
import { replaceOrInsert } from 'src/utils/storeUtils'
import { paginateArray, flattenPages } from 'src/utils/paginationUtils'

export const useProgramStore = defineStore('program', {
  state: () => ({
    programsPages: {} as Record<number, Program[]>,
    currentPagePrograms: [] as Program[],
    currentProgram: null as Program | null,
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
    async fetchPrograms(params: {
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

      if (useCache && this.programsPages[page]) {
        this.currentPagePrograms = this.programsPages[page]
        this.pagination.currentPage = page
        return
      }

      this.loading = true
      this.error = null

      try {
        const response = await ProgramService.getAll({ ...params })
        const programs = (response.content ?? []).map((dto: any) =>
          Program.fromDTO(dto)
        )

        if (!usePagination) {
          const paged = paginateArray(programs, defaultSize)
          this.programsPages = paged
          this.currentPagePrograms = paged[0] ?? []
          this.pagination = {
            totalSize: programs.length,
            totalPages: Object.keys(paged).length,
            currentPage: 0,
            pageSize: defaultSize
          }
        } else {
          this.programsPages[page] = programs
          this.currentPagePrograms = programs
          this.pagination = {
            totalSize: response.total,
            totalPages: Math.ceil(response.total / size),
            currentPage: response.page,
            pageSize: response.size
          }
        }
      } catch (error: any) {
        this.error = 'Erro ao buscar programas'
        console.error(error)
      } finally {
        this.loading = false
      }
    },

    getAllProgramsAcrossPages(): Program[] {
      return flattenPages(this.programsPages)
    },

    async getProgramDetails(id: number) {
      this.loading = true
      this.error = null
      try {
        const dto = await ProgramService.getById(id)
        this.currentProgram = Program.fromDTO(dto)
      } catch (error: any) {
        this.error = 'Erro ao buscar detalhes do programa'
        console.error(error)
      } finally {
        this.loading = false
      }
    },

    async saveProgram(programData: Partial<Program>) {
      this.error = null

      try {
        const program = programData instanceof Program
          ? programData
          : new Program(programData)

        const dtoToSend = program.toDTO()

        const savedDto = dtoToSend.id
          ? await ProgramService.update(dtoToSend)
          : await ProgramService.save(dtoToSend)

        const saved = Program.fromDTO(savedDto)
        const page = this.pagination.currentPage

        if (!this.programsPages[page]) {
          this.programsPages[page] = []
        }

        this.programsPages[page] = replaceOrInsert(this.programsPages[page], saved, 'name')

        this.currentPagePrograms = [...this.programsPages[page]]
        this.currentProgram = saved

        return saved
      } catch (error: any) {
        this.error = 'Erro ao salvar programa'
        console.error('Erro ao salvar programa:', error.response?.data || error.message || error)
        throw error
      }
    },

    async updateProgramLifeCycleStatus(uuid: string, lifeCycleStatus: string) {
      this.error = null
      try {
        const updatedDto = await ProgramService.updateLifeCycleStatus(uuid, lifeCycleStatus)
        const updated = Program.fromDTO(updatedDto)

        for (const page in this.programsPages) {
          const index = this.programsPages[page].findIndex(p => p.uuid === uuid)
          if (index !== -1) {
            this.programsPages[page][index] = updated
          }
        }

        this.currentPagePrograms = this.programsPages[this.pagination.currentPage] ?? []

        if (this.currentProgram?.uuid === uuid) {
          this.currentProgram = updated
        }

        return updated
      } catch (error: any) {
        this.error = 'Erro ao atualizar status do programa'
        console.error(error)
        throw error
      }
    },

    async deleteProgram(uuid: string) {
      this.error = null
      try {
        await ProgramService.delete(uuid)

        for (const page in this.programsPages) {
          this.programsPages[page] = this.programsPages[page].filter(
            (p) => p.uuid !== uuid
          )
        }

        this.currentPagePrograms = this.programsPages[this.pagination.currentPage] ?? []

        if (this.currentProgram?.uuid === uuid) {
          this.currentProgram = null
        }
      } catch (error: any) {
        this.error = error?.response?.data?.message || 'Erro ao apagar programa'
        console.error(error)
        throw error
      }
    }
  }
})
