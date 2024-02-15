import api from '../apiService/apiService';
import { useRepo } from 'pinia-orm';
import { plainToClass } from 'class-transformer';
import useDistrict from 'src/composables/district/districtMethods';
import District from 'src/stores/model/location/District';

const repo = useRepo(District);
const { createDistrictFromDTO } = useDistrict();

export default {
  async getByProvince(id: any) {
    return await api()
      .get(`/district/getAllOfProvince/${id}`)
      .then((resp) => {
        this.generateAndSaveEntityFromDTO(resp.data);
        return resp;
      })
      .catch((error) => {
        console.log('Error', error.message);
      });
  },
  async getAll() {
    return await api()
      .get('/district/getall')
      .then((resp) => {
        this.generateAndSaveEntityFromDTO(resp.data);
        return resp;
      })
      .catch((error) => {
        console.log('Error', error.message);
      });
  },
  generateAndSaveEntityFromDTO(dtoList: any) {
    dtoList.forEach((dto) => {
      const entity = createDistrictFromDTO(dto);
      repo.save(entity);
    });
  },
  deleteAllFromStorage() {
    repo.flush();
  },
  piniaGetAll() {
    return repo.query().orderBy('district', 'asc').get();
  },
  getAllDistrictByProvinceId(provinceid: number) {
    return repo.query().with('province').where('province_id', provinceid).get();
  },
};
