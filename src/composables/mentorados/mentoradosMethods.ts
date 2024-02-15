import useEmployee from 'src/composables/employee/employeeMethods';
import Mentorados from 'src/stores/model/mentorados/Mentorados';

export default function userMentorados() {
  function createMentoradosFromDTO(mentoradosDTO: any) {
    const { createEmployeeFromDTO } = useEmployee();

    return new Mentorados({
      id: mentoradosDTO.id,
      uuid: mentoradosDTO.uuid,
      employee: createEmployeeFromDTO(mentoradosDTO.employeeDTO),
    });
  }

  function createDTOFromMentorado(mentorados: Mentorados) {
    const { createDTOFromEmployee } = useEmployee();
    const mentoradosDTO = {
      id: mentorados.id,
      uuid: mentorados.uuid,
      employeeDTO: createDTOFromEmployee(mentorados.employee),
    };
    console.log(mentoradosDTO);
    return mentoradosDTO;
  }

  return {
    createMentoradosFromDTO,
    createDTOFromMentorado,
  };
}
