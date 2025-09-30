import api from '../apiService/apiService';
import { useRepo } from 'pinia-orm';
import Question from 'src/stores/model/question/Question';
import FormSectionQuestion from 'stores/model/form/FormSectionQuestion';
import useQuestion from 'src/composables/question/questionMethods';

const repo = useRepo(Question);
const repoFormQuestion = useRepo(FormSectionQuestion);
const { createQuestionFromDTO, createDTOFromQuestion } = useQuestion();

export default {
  async search(searchParam: string) {
    return await api()
      .get(`/questions/search?${new URLSearchParams(searchParam).toString()}`)
      .then((resp) => {
        if(resp.data.content?.length > 0)
        this.generateEntityFromDTO(resp.data.content);
        return resp;
      })
      .catch((error) => {
        console.error('Error', error.message);
      });
  },
  async getAll(searchParam: string) {
    return await api()
      .get(
        `/questions/getByPageAndSize?${new URLSearchParams(
          searchParam
        ).toString()}`
      )
      .then((resp) => {
        this.generateAndSaveEntityFromDTO(resp.data.content);
        return resp;
      })
      .catch((error) => {
        console.error('Error', error.message);
      });
  },
  async changeLifeCycleStatus(questionDTO: any) {
    return await api()
      .patch('/questions/changeLifeCicleStatus', questionDTO)
      .then((resp) => {
        return resp;
      })
      .catch((error) => {
        return error;
        console.error('Error', error.message);
      });
  },
  update(question: any) {
    repo.save(question);
  },
  generateAndSaveEntityFromDTO(dtoList: any) {
    dtoList.forEach((dto: any) => {
      const entity = createQuestionFromDTO(dto);
      repo.save(entity);
    });
  },
  generateEntityFromDTO(dtoList: any) {
    const entities = [];
    dtoList.forEach((dto) => {
      entities.push(createQuestionFromDTO(dto));
    });
    return entities;
  },
  deleteAllFromStorage() {
    repo.flush();
  },
  piniaGetAll() {
    const res = repo
      .query()
      .withAllRecursive(2)
      .orderBy('description', 'asc')
      .get();
    return res;
  },
  getByName(question: string) {
    return repo
      .query()
      .where('question', question)
      .orderBy('question', 'asc')
      .first();
  },
  async saveQuestion(question: any) {
    const questionDTO = createDTOFromQuestion(question)
    return await api()
      .post('/questions/save', questionDTO)
      .then((resp) => {
        repo.save(createQuestionFromDTO(resp.data));
        return resp;
      })
      .catch((error) => {
        console.error('Error', error.message);
      });
  },
  async deleteQuestion(questionId: number) {
      return await api()
        .delete(`/questions/${questionId}`)
        .then(
          (resp) => {
          repo.destroy(questionId);
          return resp;
        })
        .catch((error) => {
          console.error('Error', error.message);
        });
      repo.delete(questionId);
  },

  async updateQuestion(question: any) {  
    const questionDTO = createDTOFromQuestion(question)
    return await api()
      .patch('/questions/update', questionDTO)
      .then((resp) => {
        repo.save(createQuestionFromDTO(resp.data));
        return resp;
      })
      .catch((error) => {
        console.error('Error', error.message);
      });
  },
};
