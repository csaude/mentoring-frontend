import Ronda from 'src/stores/model/ronda/Ronda';
import api from '../apiService/apiService';
import { useRepo } from 'pinia-orm';
import { UserDTO } from 'src/services/dto/user/UserDTO';
import { plainToClass } from 'class-transformer';
import useRonda from 'src/composables/ronda/rondaMethods';
import RondaType from 'stores/model/ronda/RondaType';
import { useSwal } from 'src/composables/shared/dialog/dialog';

const rondaRepo = useRepo(Ronda);
const rondaTypeRepo = useRepo(RondaType);

export default {
  async getAll() {
    return await api()
      .get('/ronda/getall')
      .then((resp) => {
        this.generateAndSaveEntityFromDTO(resp.data);
        return resp;
      })
      .catch((error) => {
        console.error('Error', error.message);
      });
  },

  async search(searchParam: string) {
    return await api()
      .get(`/ronda/search?${new URLSearchParams(searchParam).toString()}`)
      .then((resp) => {
        this.generateAndSaveEntityFromDTO(resp.data);
        return resp;
      })
      .catch((error) => {
        console.error('Error', error.message);
      });
  },

  async generateReport(uuid: string) {
    return await api()
      .get(`/ronda/report/${uuid}`)
      .then((resp) => {
        return resp;
      })
      .catch((error) => {
        console.error('Error', error.message);
      });
  },

  async getAllRondaType() {
    return await api()
      .get('/rondaTypes/getall')
      .then((resp) => {
        this.generateAndSaveRondaTypeFromDTO(resp.data);
        return resp;
      })
      .catch((error) => {
        console.error('Error', error.message);
      });
  },
  generateAndSaveEntityFromDTO(dtoList: any) {
    dtoList.forEach((dto: any) => {
      const entity = useRonda().createRondaFromDTO(dto);
      rondaRepo.save(entity);
    });
  },
  generateAndSaveRondaTypeFromDTO(dtoList: any) {
    dtoList.forEach((dto: any) => {
      const entity = useRonda().createRondaTypeFromDTO(dto);
      rondaTypeRepo.save(entity);
    });
  },

  async post(obj: string) {
    try {
      const resp = await api().post(
        'ronda',
        plainToClass(UserDTO, obj, { excludeExtraneousValues: true })
      );
      //ronda.save();
    } catch (error: any) {
      console.error(error);
    }
  },

  async changeMentor(rondaId: number, newMentorId: number) {
    try {
      const resp = await api().post(
        `ronda/changeMentor/${rondaId}/${newMentorId}`
      );
      useRonda().createRondaFromDTO(resp.data);
      return resp;
    } catch (error: any) {
      const backendMessage =
        error.response?.data?.error || 'Erro ao trocar mentor.';
      console.error('Erro ao trocar mentor:', backendMessage);
      useSwal().alertError('Erro: ' + backendMessage);
      throw new Error(backendMessage);
    }
  },

  getById(id: number) {
    return rondaRepo
      .query()
      .withAllRecursive(2)
      .where('id', id)
      .orderBy('id', 'asc')
      .first();
  },

  getAllOnPinia() {
    return rondaRepo.query().withAllRecursive(3).orderBy('id', 'asc').get();
  },
};
