import api from '../apiService/apiService';
import { useRepo } from 'pinia-orm';
import Location from 'src/stores/model/location/Location';

const locationRepo = useRepo(Location);

export default {

      deleteAllFromStorage() {
        locationRepo.flush();
      },
      getLocationList() {
        return locationRepo
                      .query()
                      .withAllRecursive(2)
                      .orderBy('id', 'asc')
                      .get();
      },
      getById(id: any) {
        return locationRepo
            .query()
            .withAll()
            .where('id', id)
            .orderBy('id', 'asc')
            .first();
      },
      getByEmployeeId(employeeId: any) {
        return locationRepo
            .query()
            .withAll()
            .where('employee_id', employeeId)
            .orderBy('id', 'asc').get();
      }

};