import useEmployee from 'src/composables/employee/employeeMethods';
import useTutorProgrammaticArea from '../tutorProgrammaticArea/tutorProgrammaticAreaMethods';
import Mentor from 'src/stores/model/mentor/Mentor';
import TutorInternalLocation from 'src/stores/model/mentor/TutorInternalLocation';

export default function useMentor() {
  function createMentorFromDTO(mentorDTO: any) {
    const { createEmployeeFromDTO } = useEmployee();
    const { createTutorProgrammaticAreaFromDTO } = useTutorProgrammaticArea();
    return new Mentor({
      id: mentorDTO.id,
      uuid: mentorDTO.uuid,
      employee: createEmployeeFromDTO(mentorDTO.employeeDTO),
      tutorProgrammaticAreas: createTutorProgrammaticAreaFromDTO(
        mentorDTO.tutorProgrammaticAreaDTOS,
        mentorDTO
      ),
      internalLocation: createInternalLocationFromDTO(
        mentorDTO.internalLocationDTO
      ),
    });
  }

  function createDTOFromMentor(mentor: Mentor) {
    const { createDTOFromEmployee } = useEmployee();

    // Location marcada como interna
    const internalEmployeeLocation = mentor.employee.locations.find(
      (l) => l.isInternal === true
    );

    const mentorDTO = {
      id: mentor.id,
      uuid: mentor.uuid,
      employeeDTO: createDTOFromEmployee(mentor.employee),
      tutorProgrammaticAreaDTOS: createDTOsFromTPAs(
        mentor.tutorProgrammaticAreas
      ),

      // internalLocation vem da location interna do employee
      internalLocationDTO: internalEmployeeLocation
        ? {
            // id/uuid só existem se já vierem do backend
            id: mentor.internalLocation?.id ?? null,
            uuid: mentor.internalLocation?.uuid ?? null,

            startDate: mentor.internalLocation?.startDate ?? new Date(),
            endDate: null,

            healthFacilityDTO: internalEmployeeLocation.healthFacility,
          }
        : null,
    };

    return mentorDTO;
  }

  function createDTOsFromTPAs(tutorProgrammaticAreas: any) {
    const { createDTOFromTutorProgrammaticArea } = useTutorProgrammaticArea();
    const tutorProgrammaticAreaDTOs = [];
    tutorProgrammaticAreas.forEach((tpa) => {
      tutorProgrammaticAreaDTOs.push(createDTOFromTutorProgrammaticArea(tpa));
    });

    return tutorProgrammaticAreaDTOs;
  }

  function createInternalLocationFromDTO(
    dto: any
  ): TutorInternalLocation | null {
    if (!dto) return null;

    return new TutorInternalLocation({
      id: dto.id,
      uuid: dto.uuid,
      startDate: dto.startDate,
      endDate: dto.endDate,
      healthFacility: dto.healthFacilityDTO,
    });
  }

  function createInternalLocationDTOFromModel(model: TutorInternalLocation) {
    return {
      id: model.id,
      uuid: model.uuid,
      startDate: model.startDate,
      endDate: model.endDate,
      healthFacilityDTO: model.healthFacility,
    };
  }

  return {
    createMentorFromDTO,
    createDTOFromMentor,
    createInternalLocationFromDTO,
    createInternalLocationDTOFromModel,
  };
}
