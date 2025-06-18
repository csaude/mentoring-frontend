import api from '../../services/api/apiService/apiService'

export default {
  async getAll(
    params: {
      page?: number
      size?: number
      sort?: string
      name?: string
      [key: string]: any
    } = {}
  ) {
    const response = await api().get('/questions', { params })
    return response.data
  },

  async getById(id: number) {
    const response = await api().get(`/questions/${id}`)
    return response.data
  },

  async save(data: any) {
    try {
      const response = await api().post('/questions', data)
      return response.data.data
    } catch (error: any) {
      console.error('Erro na API ao salvar competência:', error.response?.data || error.message || error)
      throw error
    }
  },

  async update(data: any) {
    try {
      const response = await api().put('/questions', data)
      return response.data.data
    } catch (error: any) {
      console.error('Erro na API ao atualizar competência:', error.response?.data || error.message || error)
      throw error
    }
  },

  async delete(uuid: string) {
    await api().delete(`/questions/${uuid}`)
  },

  async updateLifeCycleStatus(uuid: string, lifeCycleStatus: string) {
    try {
      const response = await api().put(`/questions/${uuid}/status`, {
        lifeCycleStatus
      })
      return response.data.data
    } catch (error: any) {
      console.error('Erro na API ao atualizar status da competência:', error.response?.data || error.message || error)
      throw error
    }
  }
}
