import api from '../api/apiService/apiService'

export default {
  async getAll(params = {}) {
    const response = await api().get('/district', { params })
    return response.data
  },

  async getById(id: number) {
    const response = await api().get(`/district/${id}`)
    return response.data
  }
}
