import api from '../apiService/apiService';
import { useRepo } from 'pinia-orm';
import Form from 'src/stores/model/form/Form';
import useForm from 'src/composables/form/formMethods';

const repo = useRepo(Form);
const { createFormFromDTO, createDTOFromForm } = useForm();

export default {
  async search(searchParam: string) {
    return await api()
      .get(`/forms/search?${new URLSearchParams(searchParam).toString()}`)
      .then((resp) => {
        if (resp.status === 200 || (resp.status === 201)) {
          if(resp.data?.content?.length > 0)
          this.generateAndSaveEntityFromDTO(resp.data?.content);
        }
        return resp;
      })
      .catch((error) => {
        console.error('Error', error.message);
        return error;
      });
  },
  async saveOrUpdate(form: any) {
    const formDTO = createDTOFromForm(form)
    return await api()
      .post('/forms/saveOrUpdate', formDTO)
      .then((resp) => {
        if (resp.status === 200 || resp.status === 201) {
          const entity = createFormFromDTO(resp.data);
          repo.save(entity);
        }
        return resp;
      })
      .catch((error) => {
        console.error('Error', error);
        return error;
      });
  },
  async changeLifeCycleStatus(formDTO: any) {
    return await api()
      .patch('/forms/changeLifeCicleStatus', formDTO)
      .then((resp) => {
        return resp;
      })
      .catch((error) => {
        return error;
        console.error('Error', error.message);
      });
  },
  async deleteFormSection(formSectionId: number) {
    return await api()
      .delete(`/forms/${formSectionId}`)
      .then(
        (resp) => {
          repo.destroy(formSectionId);
          return resp;
        })
      .catch((error) => {
        console.error('Error', error.message);
      });
    repo.delete(formSectionId);
  },
  generateAndSaveEntityFromDTO(dtoList: any) {
    dtoList.forEach((dto: any) => {
      const entity = createFormFromDTO(dto);
      repo.save(entity);
    });
  },
  deleteAllFromStorage() {
    repo.flush();
  },
  piniaGetAll() {
    return repo.query().orderBy('description', 'asc').get();
  },
  getFormList() {
    return repo.query().withAllRecursive(2).orderBy('id', 'asc').get();
  },
  getById(id: number) {
    return repo
      .query()
      .withAllRecursive(2)
      .where('id', id)
      .orderBy('id', 'asc')
      .first();
  },
  update(form: any) {
    repo.save(form);
  },
};
