import api from '../apiService/apiService';
import { useRepo } from 'pinia-orm';
import { UserDTO } from 'src/services/dto/user/UserDTO';
import { plainToClass } from 'class-transformer';
import userMentorados from 'src/composables/mentorados/mentoradosMethods';

import ProfessionalCategory from 'src/stores/model/professionalCategory/ProfessionalCategory';
import Mentorados from 'src/stores/model/mentorados/Mentorados';
import { error } from 'console';

const mentoradosRepo = useRepo(Mentorados);
const { createMentoradosFromDTO } = userMentorados();

export default {
  async search(searchParam: string) {
    return await api()
      .get(`/tutored/search?${new URLSearchParams(searchParam).toString()}`)
      .then((resp) => {
        this.generateAndSaveMentoradosFromDTO(resp.data);
        return resp;
      });
  },

  async update(mentorados: any) {
    return await api()
      .put('/tutored/update', mentorados)
      .then((resp) => {
        mentoradosRepo.update(createMentoradosFromDTO(resp.data));
        return resp;
      })
      .catch((error) => {
        console.log('Error', error);
      });
  },
  async getByUuid(uuid: string) {
    return await api()
      .get(`/tutored/${uuid}`)
      .then((resp) => {
        this.generateAndSaveMentoradosFromDTO(resp.data);
        return resp;
      })
      .catch((error) => {
        console.log('Error', error.message);
      });
  },

  generateAndSaveMentoradosFromDTO(mentoradosList: any) {
    mentoradosList.forEach((mentoradosDTO) => {
      const mentorado = createMentoradosFromDTO(mentoradosDTO);
      mentoradosRepo.save(mentorado);
    });
  },

  deleteAllFromStorage() {
    mentoradosRepo.flush();
  },
  getMentoradosList() {
    return mentoradosRepo
      .query()
      .withAllRecursive(2)
      .orderBy('id', 'asc')
      .get();
  },
  getById(id: number) {
    return mentoradosRepo
      .query()
      .withAllRecursive(2)
      .where('id', id)
      .orderBy('id', 'asc')
      .first();
  },
};
