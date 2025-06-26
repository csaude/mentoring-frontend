import api from '../api/apiService/apiService'

export default {
  async getAll(params: any = {}) {
    const response = await api().get('/user/search', {
      params: {
        query: params.query || '',
        page: params.page ?? 0,
        size: params.size ?? 10
      }
    })

    return response.data
  }
,

  async save(data: any) {
    const response = await api().post('/user', data)
    return response.data.data
  },

  async update(data: any) {
    const response = await api().put('/user', data)
    return response.data.data
  },

  async delete(uuid: string) {
    await api().delete(`/user/${uuid}`)
  },

  async updateLifeCycleStatus(uuid: string, lifeCycleStatus: string) {
    try {
      const response = await api().put(`/user/${uuid}/status`, {
        lifeCycleStatus
      })
      return response.data.data
    } catch (error: any) {
      console.error('Erro na API ao atualizar status do utilizador:', error.response?.data || error.message || error)
      throw error
    }
  }

}
