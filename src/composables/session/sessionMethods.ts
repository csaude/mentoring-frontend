// src/composables/session/sessionMethods.ts
import Session from 'stores/model/session/Session';
import useForm from '../form/formMethods';

export default function usSession() {
  async function createSessionFromDTO(sessionDTO: any) {
    return new Session({
      id: sessionDTO.id,
      uuid: sessionDTO.uuid,
      code: sessionDTO.code,
      performedDate: sessionDTO.performedDate,
      description: sessionDTO.description,
      startDate: sessionDTO.startDate,
      endDate: sessionDTO.endDate,
      reason: sessionDTO.reason,

      ronda_id: sessionDTO.ronda?.id,
      form_id: sessionDTO.form?.id,
      form: sessionDTO.form
        ? await useForm().createFormFromDTO(sessionDTO.form)
        : null,
    });
  }

  function createDTOFromSession(session: Session) {
    // NAO USADO POR ENQUANTO
    return {
      id: session.id,
      uuid: session.uuid,
      code: session.code,
      description: session.description,
      startDate: session.startDate,
      endDate: session.endDate,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      mentor: session.mentor
        ? {
            id: session.mentor.id,
            uuid: session.mentor.uuid,
            employee_id: session.mentor.employee_id,
          }
        : null,
      ronda: session.ronda
        ? {
            id: session.ronda.id,
            uuid: session.ronda.uuid,
          }
        : null,
      location: session.location
        ? {
            id: session.location.id,
            uuid: session.location.uuid,
            name: session.location.name,
          }
        : null,
    };
  }

  return {
    createSessionFromDTO,
    createDTOFromSession,
  };
}
