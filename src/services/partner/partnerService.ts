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
    const response = await api().get('/partner', { params })
    return response.data
  },

  async getById(id: number) {
    const response = await api().get(`/partner/${id}`)
    return response.data
  },

  async save(data: any) {
    try {
      const response = await api().post('/partner', data)
      return response.data.data
    } catch (error: any) {
      console.error('Erro na API ao salvar parceiro:', error.response?.data || error.message || error)
      throw error
    }
  },

  async update(data: any) {
    try {
      const response = await api().put('/partner', data)
      return response.data.data
    } catch (error: any) {
      console.error('Erro na API ao atualizar parceiro:', error.response?.data || error.message || error)
      throw error
    }
  },

  async delete(uuid: string) {
    await api().delete(`/partner/${uuid}`)
  },

  async updateLifeCycleStatus(uuid: string, lifeCycleStatus: string) {
    try {
      const response = await api().put(`/partner/${uuid}/status`, { lifeCycleStatus })
      return response.data.data
    } catch (error: any) {
      console.error('Erro na API ao atualizar status do parceiro:', error.response?.data || error.message || error)
      throw error
    }
  }
}
