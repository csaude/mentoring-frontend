import Employee from 'src/stores/model/employee/Employee';
import useProfessionalCategory from 'src/composables/professionalCategory/professionalCategoryMethods';
import useLocation from '../location/locationMethods';
import usePartner from '../partner/partnerMethods';

export default function useEmployee() {
  function fullName(employee: Employee) {
    return `${employee.name} ${employee.surname}`;
  }

  function createEmployeeFromDTO(employeeDTO: any) {
    const { createProfessionalCategoryFromDTO } = useProfessionalCategory();
    const { createPartnerFromDTO } = usePartner();
    return new Employee({
      id: employeeDTO.id,
      uuid: employeeDTO.uuid,
      name: employeeDTO.name,
      surname: employeeDTO.surname,
      nuit: employeeDTO.nuit,
      email: employeeDTO.email,
      trainingYear: employeeDTO.trainingYear,
      phoneNumber: employeeDTO.phoneNumber,
      locations: createLocation(employeeDTO.locationDTOSet),
      professionalCategory: createProfessionalCategoryFromDTO(
        employeeDTO.professionalCategoryDTO
      ),
      partner: createPartnerFromDTO(employeeDTO.partnerDTO),
    });
  }

  function createDTOFromEmployee(employee: Employee) {
    const { createDTOFromProfessionalCategory } = useProfessionalCategory();
    const { createDTOFromPartner } = usePartner();
    console.log(employee);
    const employeeDTO = {
      id: employee.id,
      uuid: employee.uuid,
      name: employee.name,
      surname: employee.surname,
      nuit: employee.nuit,
      email: employee.email,
      trainingYear: employee.trainingYear,
      phoneNumber: employee.phoneNumber,
      locationDTOSet: createLocationDTO(employee.locations),
      // partnerDTO: createDTOFromPartner(employee.partner),
      professionalCategoryDTO: createDTOFromProfessionalCategory(
        employee.professionalCategory
      ),
    };
    return employeeDTO;
  }

  function createLocation(locationDTOS: any) {
    const { createLocationFromDTO } = useLocation();
    const generatedLocations = [];
    locationDTOS.forEach((location) => {
      generatedLocations.push(createLocationFromDTO(location));
    });
    return generatedLocations;
  }

  function createLocationDTO(locations: any) {
    const { createDTOFromLocation } = useLocation();
    const generatedLocations = [];
    locations.forEach((location) => {
      generatedLocations.push(createDTOFromLocation(location));
    });
    return generatedLocations;
  }

  return {
    fullName,
    createEmployeeFromDTO,
    createDTOFromEmployee,
  };
}
