import api from '../api/apiService/apiService'

export default {
  async getAll(
    params: {
      page?: number
      size?: number
      sort?: string
      name?: string // para busca por nome
      [key: string]: any
    } = {}
  ) {
    const response = await api().get('/programmaticareas', { params })
    return response.data
  },

  async getById(id: number) {
    const response = await api().get(`/programmaticareas/${id}`)
    return response.data
  },

  async save(data: any) {
    try {
      const response = await api().post('/programmaticareas', data)
      return response.data.data
    } catch (error: any) {
      console.error('Erro na API ao salvar área programática:', error.response?.data || error.message || error)
      throw error
    }
  },

  async update(data: any) {
    try {
      const response = await api().put('/programmaticareas', data)
      return response.data.data
    } catch (error: any) {
      console.error('Erro na API ao atualizar área programática:', error.response?.data || error.message || error)
      throw error
    }
  },

  async delete(uuid: string) {
    await api().delete(`/programmaticareas/${uuid}`)
  },

  async updateLifeCycleStatus(uuid: string, lifeCycleStatus: string) {
    try {
      const response = await api().put(`/programmaticareas/${uuid}/status`, {
        lifeCycleStatus
      })
      return response.data.data
    } catch (error: any) {
      console.error('Erro na API ao atualizar status da área programática:', error.response?.data || error.message || error)
      throw error
    }
  }
}
