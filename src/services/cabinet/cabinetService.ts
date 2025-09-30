import api from '../api/apiService/apiService'

export default {
  async getAll(
    params: {
      page?: number
      size?: number
      sort?: string
      name?: string // busca por nome
      [key: string]: any
    } = {},
  ) {
    const response = await api().get('/cabinets', { params })
    return response.data
  },

  async getById(id: number) {
    const response = await api().get(`/cabinets/${id}`)
    return response.data
  },

  async save(data: any) {
    try {
      const response = await api().post('/cabinets', data)
      return response.data.data
    } catch (error: any) {
      console.error('Erro na API ao salvar sector:', error.response?.data || error.message || error)
      throw error
    }
  },

  async update(data: any) {
    try {
      const response = await api().put('/cabinets', data)
      return response.data.data
    } catch (error: any) {
      console.error('Erro na API ao atualizar sector:', error.response?.data || error.message || error)
      throw error
    }
  },

  async delete(uuid: string) {
    await api().delete(`/cabinets/${uuid}`)
  },

  async updateLifeCycleStatus(uuid: string, lifeCycleStatus: string) {
    try {
      const response = await api().put(`/cabinets/${uuid}/status`, { lifeCycleStatus })
      return response.data.data
    } catch (error: any) {
      console.error(
        'Erro na API ao atualizar estado do sector:',
        error.response?.data || error.message || error
      )
      throw error
    }
  },
}
