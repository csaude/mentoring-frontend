import api from '../apiService/apiService';
import { useRepo } from 'pinia-orm';
import EvaluationType from 'src/stores/model/question/EvaluationType';
import useEvaluationType from 'src/composables/question/evaluationTypeMethods';

const repo = useRepo(EvaluationType);
const { createEvaluationTypeFromDTO } = useEvaluationType();

export default {
  async getAll() {
    return await api()
      .get('/evaluationTypes/getAll')
      .then((resp) => {
        this.generateAndSaveEntityFromDTO(resp.data);
        return resp;
      })
      .catch((error) => {
        console.error('Error', error.message);
      });
  },
  generateAndSaveEntityFromDTO(dtoList: any) {
    dtoList.forEach((dto) => {
      const entity = createEvaluationTypeFromDTO(dto);
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
