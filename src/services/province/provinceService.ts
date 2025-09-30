import api from '../api/apiService/apiService'

export default {
  async getAll(params = {}) {
    const response = await api().get('/province', { params })
    return response.data
  },

  async getById(id: number) {
    const response = await api().get(`/province/${id}`)
    return response.data
  }
}
