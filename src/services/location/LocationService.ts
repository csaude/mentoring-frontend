import api from '../api/apiService/apiService'

export default {
  async getAll(params: any = {}) {
    const response = await api().get('/locations', { params })
    return response.data
  },

  async save(data: any) {
    const response = await api().post('/locations', data)
    return response.data.data
  },

  async update(data: any) {
    const response = await api().put('/locations', data)
    return response.data.data
  },

  async delete(uuid: string) {
    await api().delete(`/locations/${uuid}`)
  }
}