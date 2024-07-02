import api from '../apiService/apiService';
import { useRepo } from 'pinia-orm';
import { UserDTO } from 'src/services/dto/user/UserDTO';
import { plainToClass } from 'class-transformer';
import Mentor from 'src/stores/model/mentor/Mentor';
import useMentor from 'src/composables/mentor/mentorMethods';

const mentorRepo = useRepo(Mentor);
const { createMentorFromDTO } = useMentor();

export default {
  async search(searchParam: string) {
    return await api()
      .get(`/mentor/search?${new URLSearchParams(searchParam).toString()}`)
      .then((resp) => {
        this.generateAndSaveMentorsFromDTO(resp.data);
        return resp;
      })
      .catch((error) => {
        console.error('Error', error.message);
      });
  },
  async save(mentor: any) {
    return await api()
      .post('/mentor/save', mentor)
      .then((resp) => {
        mentorRepo.save(createMentorFromDTO(resp.data));
        return resp;
      })
      .catch((error) => {
        console.error('Error', error);
        return error;
      });
  },
  async update(mentor: any) {
    return await api()
      .patch('/mentor/update', mentor)
      .then((resp) => {
        mentorRepo.save(createMentorFromDTO(resp.data));
        return resp;
      })
      .catch((error) => {
        console.error('Error', error);
        return error;
      });
  },
  generateAndSaveMentorsFromDTO(mentorList: any) {
    mentorList.forEach((mentorDTO: any) => {
      const mentor = createMentorFromDTO(mentorDTO);
      mentorRepo.save(mentor);
    });
  },
  deleteAllFromStorage() {
    mentorRepo.flush();
  },
  getMentorList() {
    return mentorRepo.query().withAllRecursive(3).orderBy('id', 'asc').get();
  },
  getById(id: number) {
    return mentorRepo
      .query()
      .withAllRecursive(2)
      .where('id', id)
      .orderBy('id', 'asc')
      .first();
  },

  getMentorsByHealthFacilityId(healthFacilityId: number) {
    console.log(healthFacilityId)
    return mentorRepo
        .query()
        .withAllRecursive(3)
        .whereHas('employee', (query) => {
            query.whereHas('locations', (locationQuery) => {
              locationQuery.where('healthFacility_id', healthFacilityId)
            })
        })
        .get();
  },

  // async getMentorsByHealthFacilityId(healthFacilityId) {
  //   return await api()
  //       .get(`/mentor/healthfacility/${healthFacilityId}`)
  //       .then((resp) => {
  //         const mentors = resp.data.map(mentorDTO => createMentorFromDTO(mentorDTO));
  //         mentorRepo.save(mentors);
  //         return mentors;
  //       })
  //       .catch((error) => {
  //         console.error('Error', error.message);
  //         return [];
  //       });
  // },
};
