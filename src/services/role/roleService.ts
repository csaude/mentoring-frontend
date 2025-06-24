import api from '../api/apiService/apiService'

export default {
  async getAll() {
    const response = await api().get('/roles/getAll')
    return response.data
  },

  async getById(id: number) {
    const response = await api().get(`/roles/${id}`)
    return response.data
  },

  async save(role: any) {
    const response = await api().post('/roles', role)
    return response.data
  },

  async update(role: any) {
    const response = await api().put(`/roles/${role.id}`, role)
    return response.data
  },

  async delete(id: number) {
    const response = await api().delete(`/roles/${id}`)
    return response.data
  }
}
