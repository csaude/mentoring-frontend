import { defineStore } from 'pinia'
import QuestionService from '../../services/question/QuestionService'
import { Question } from 'src/entities/question/Question'
import { replaceOrInsert } from 'src/utils/storeUtils'
import { paginateArray, flattenPages } from 'src/utils/paginationUtils'

export const useQuestionStore = defineStore('question', {
  state: () => ({
    questionsPages: {} as Record<number, Question[]>,
    currentPageQuestions: [] as Question[],
    currentQuestion: null as Question | null,
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
    async fetchQuestions(params: {
      page?: number
      size?: number
      sort?: string
      name?: string
      ignoreCache?: boolean
      [key: string]: any
    } = {}) {
      const defaultSize = this.pagination.pageSize
      const page = params.page ?? 0
      const size = params.size ?? defaultSize
      const name = params.name ?? ''
      const ignoreCache = params.ignoreCache ?? false

      const isSearch = name.trim() !== ''
      const usePagination = params.page !== undefined || params.size !== undefined
      const useCache = !ignoreCache && !isSearch && this.questionsPages[page]

      if (useCache) {
        this.currentPageQuestions = this.questionsPages[page]
        this.pagination.currentPage = page
        return
      }

      this.loading = true
      this.error = null

      try {
        const response = await QuestionService.getAll({ ...params, page, size, name })
        const questions = (response.content ?? []).map((dto: any) =>
          Question.fromDTO(dto)
        )

        if (!isSearch && !usePagination) {
          const paged = paginateArray(questions, defaultSize)
          this.questionsPages = paged
          this.currentPageQuestions = paged[0] ?? []
          this.pagination = {
            totalSize: questions.length,
            totalPages: Object.keys(paged).length,
            currentPage: 0,
            pageSize: defaultSize
          }
        } else {
          this.questionsPages[page] = questions
          this.currentPageQuestions = questions
          this.pagination = {
            totalSize: response.total,
            totalPages: Math.ceil(response.total / size),
            currentPage: response.page,
            pageSize: response.size
          }
        }
      } catch (error: any) {
        this.error = 'Erro ao buscar competências'
        console.error(error)
      } finally {
        this.loading = false
      }
    },

    getAllQuestionsAcrossPages(): Question[] {
      return flattenPages(this.questionsPages)
    },

    async getQuestionDetails(id: number) {
      this.loading = true
      this.error = null
      try {
        const dto = await QuestionService.getById(id)
        this.currentQuestion = Question.fromDTO(dto)
      } catch (error: any) {
        this.error = 'Erro ao buscar detalhes da competência'
        console.error(error)
      } finally {
        this.loading = false
      }
    },

    async saveQuestion(questionData: Partial<Question>) {
      this.error = null
      try {
        const question = questionData instanceof Question
          ? questionData
          : new Question(questionData)

        const dtoToSend = question.toDTO()

        const savedDto = dtoToSend.id
          ? await QuestionService.update(dtoToSend)
          : await QuestionService.save(dtoToSend)

        const saved = Question.fromDTO(savedDto)
        const page = this.pagination.currentPage

        if (!this.questionsPages[page]) {
          this.questionsPages[page] = []
        }

        this.questionsPages[page] = replaceOrInsert(this.questionsPages[page], saved, 'question')
        this.currentPageQuestions = [...this.questionsPages[page]]
        this.currentQuestion = saved

        return saved
      } catch (error: any) {
        this.error = 'Erro ao salvar competência'
        console.error(error)
        throw error
      }
    },

    async updateQuestionLifeCycleStatus(uuid: string, lifeCycleStatus: string) {
      this.error = null
      try {
        const updatedDto = await QuestionService.updateLifeCycleStatus(uuid, lifeCycleStatus)
        const updatedQuestion = Question.fromDTO(updatedDto)

        for (const page in this.questionsPages) {
          const index = this.questionsPages[page].findIndex(q => q.uuid === uuid)
          if (index !== -1) {
            this.questionsPages[page][index] = updatedQuestion
          }
        }

        this.currentPageQuestions = this.questionsPages[this.pagination.currentPage] ?? []

        if (this.currentQuestion?.uuid === uuid) {
          this.currentQuestion = updatedQuestion
        }

        return updatedQuestion
      } catch (error: any) {
        this.error = 'Erro ao atualizar status da competência'
        console.error(error)
        throw error
      }
    },

    async deleteQuestion(uuid: string) {
      this.error = null
      try {
        await QuestionService.delete(uuid)

        for (const page in this.questionsPages) {
          this.questionsPages[page] = this.questionsPages[page].filter(
            (q) => q.uuid !== uuid
          )
        }

        this.currentPageQuestions = this.questionsPages[this.pagination.currentPage] ?? []

        if (this.currentQuestion?.uuid === uuid) {
          this.currentQuestion = null
        }
      } catch (error: any) {
        const apiMessage =
          error?.response?.data?.message || 'Erro ao apagar competência'
        this.error = apiMessage
        console.error(error)
        throw error
      }
    }
  }
})
