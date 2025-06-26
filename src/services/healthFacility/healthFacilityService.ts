import api from '../api/apiService/apiService'

export default {
  async getAll(params = {}) {
    const response = await api().get('/healthFacilities', { params })
    return response.data
  },

  async getById(id: number) {
    const response = await api().get(`/healthFacilities/${id}`)
    return response.data
  },

  async save(data: any) {
    const response = await api().post('/healthFacilities', data)
    return response.data.data
  },

  async update(data: any) {
    const response = await api().put('/healthFacilities', data)
    return response.data.data
  },

  async delete(uuid: string) {
    await api().delete(`/healthFacilities/${uuid}`)
  },

  async updateLifeCycleStatus(uuid: string, lifeCycleStatus: string) {
    const response = await api().put(`/healthFacilities/${uuid}/status`, { lifeCycleStatus })
    return response.data.data
  },

  async getByDistrictId(districtId) {
    const response = await api().get(`/healthFacilities/getAllOfDistrict/${districtId}`)
    return response.data
  }
}
