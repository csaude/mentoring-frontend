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
    const response = await api().get('/professionalCategories', { params })
    return response.data
  },

  async getById(id: number) {
    const response = await api().get(`/professionalCategories/${id}`)
    return response.data
  },

  async save(data: any) {
    try {
      const response = await api().post('/professionalCategories', data)
      return response.data.data
    } catch (error: any) {
      console.error('Erro na API ao salvar categoria profissional:', error.response?.data || error.message || error)
      throw error
    }
  },

  async update(data: any) {
    try {
      const response = await api().put('/professionalCategories', data)
      return response.data.data
    } catch (error: any) {
      console.error('Erro na API ao atualizar categoria profissional:', error.response?.data || error.message || error)
      throw error
    }
  },

  async delete(uuid: string) {
    await api().delete(`/professionalCategories/${uuid}`)
  },

  async updateLifeCycleStatus(uuid: string, lifeCycleStatus: string) {
    try {
      const response = await api().put(`/professionalCategories/${uuid}/status`, {
        lifeCycleStatus
      })
      return response.data.data
    } catch (error: any) {
      console.error('Erro na API ao atualizar status da categoria profissional:', error.response?.data || error.message || error)
      throw error
    }
  }
}
