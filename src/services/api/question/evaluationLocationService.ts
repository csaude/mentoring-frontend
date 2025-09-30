import api from '../apiService/apiService';
import { useRepo } from 'pinia-orm';
import EvaluationLocation from 'src/stores/model/question/EvaluationLocation';
import useEvaluationLocation from 'src/composables/question/evaluationLocationMethods';

const repo = useRepo(EvaluationLocation);
const { createEvaluationLocationFromDTO } = useEvaluationLocation();

export default {
  async getAll() {
    return await api()
      .get('/evaluationLocations/getAll')
      .then((resp) => {
        this.generateAndSaveEntityFromDTO(resp.data?.content);
        return resp;
      })
      .catch((error) => {
        console.error('Error', error.message);
      });
  },
  generateAndSaveEntityFromDTO(dtoList: any) {
    dtoList.forEach((dto) => {
      const entity = createEvaluationLocationFromDTO(dto);
      repo.save(entity);
    });
  },
  deleteAllFromStorage() {
    repo.flush();
  },
  piniaGetAll() {
    return repo.query().orderBy('description', 'asc').get();
  },
  getByDescription(description: string) {
    return repo
      .query()
      .where('description', description)
      .orderBy('description', 'asc')
      .first();
  },
  getByUuid(uuid: string) {
    return repo
      .query()
      .where('uuid', uuid)
      .orderBy('description', 'asc')
      .first();
  },
};
