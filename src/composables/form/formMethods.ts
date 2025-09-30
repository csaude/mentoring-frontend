import Form from "src/stores/model/form/Form";
import useProgrammaticArea from "src/composables/programmaticArea/programmaticAreaMethods";
import useFormType from "./formTypeMethods";
import useFormSectionQuestion from "./formSectionQuestionMethods";
import usePartner from "src/composables/partner/partnerMethods";
import useSection from "src/composables/section/sectionMethods";
import useFormSection from "src/composables/form/formSectionMethods";
import useEvaluationLocation from '../question/evaluationLocationMethods';

export default function useForm() {
  
  const {createEvaluationLocationFromDTO, createDTOFromEvaluationLocation} = useEvaluationLocation();

    function createFormFromDTO(formDTO: any) {
      const { createProgrammaticAreaFromDTO } = useProgrammaticArea();
      const { createPartnerFromDTO } = usePartner();
      const { createFormSectionFromDTO } = useFormSection();

      return new Form({
        id: formDTO.id,
        uuid: formDTO.uuid,
        code: formDTO.code,
        name: formDTO.name,
        description: formDTO.description,
        targetPatient: formDTO.targetPatient,
        lifeCycleStatus: formDTO.lifeCycleStatus,
        targetFile: formDTO.targetFile,
        createdAt: formDTO.createdAt,
        createdBy: formDTO.createdBy,
        programmaticArea: createProgrammaticAreaFromDTO(formDTO.programmaticAreaDTO),
        evaluationLocation: createEvaluationLocationFromDTO(formDTO.evaluationLocationDTO),

        // Safely handle form sections if not null, using the factory method
        formSections: formDTO.formSections
            ? createFormSectionsListFromDTOs(formDTO.formSections)
            : []
    });

    }

    function createDTOFromForm(form: Form) {
      const { createDTOFromProgrammaticArea } = useProgrammaticArea();
      const { createDTOFromPartner } = usePartner();
      const { createDTOFromFormSection } = useFormSection();

        const formDTO = {
          id: form.id,
          uuid: form.uuid,
          code: form.code,
          lifeCycleStatus: form.lifeCycleStatus,
          name: form.name,
          description: form.description,
          targetPatient: form.targetPatient,
          targetFile: form.targetFile,
          createdAt: form.createdAt,
          createdBy: form.createdBy,          
          evaluationLocationDTO: createDTOFromEvaluationLocation(form.evaluationLocation),
          programmaticAreaDTO: createDTOFromProgrammaticArea(form.programmaticArea),
          //formSectionQuestions: createDTOsListFromFormQuestions(form.formSectionQuestions), // Handling form questions
          formSections: createDTOsListFromFormSections(form.formSections), // Handling form sections
        };
        return formDTO;
    }

    function createFormQuestionsListFromDTOs(formQuestionDTOS: any) {
      const { createFormSectionQuestionFromDTO } = useFormSectionQuestion();
      const generatedFormQuestions = [];
      formQuestionDTOS.forEach((formQuestionDTO) => {
        const formQuestion = createFormSectionQuestionFromDTO(formQuestionDTO);
        generatedFormQuestions.push(formQuestion);
      });
      return generatedFormQuestions;
    }

    function createDTOsListFromFormQuestions(formQuestions: any) {
      const { createDTOFromFormSectionQuestion } = useFormSectionQuestion();
      const generatedFormQuestions = [];
      formQuestions.forEach((formQuestion) => {
        const formQuestionDTO = createDTOFromFormSectionQuestion(formQuestion);
        generatedFormQuestions.push(formQuestionDTO);
      });
      return generatedFormQuestions;
    }

    function createFormSectionsListFromDTOs(formSectionDTOS: any) {
      const { createFormSectionFromDTO } = useFormSection();
      const generatedFormSections = [];
      formSectionDTOS.forEach((formSectionDTO) => {
        const formSection = createFormSectionFromDTO(formSectionDTO);
        generatedFormSections.push(formSection);
      });
      return generatedFormSections;
    }

    function createDTOsListFromFormSections(formSections: any) {
      const { createDTOFromFormSection } = useFormSection();
      const generatedFormSections = [];
      formSections.forEach((formSection) => {
        const formSectionDTO = createDTOFromFormSection(formSection);
        generatedFormSections.push(formSectionDTO);
      });
      return generatedFormSections;
    }

    return {
        createFormFromDTO,
        createDTOFromForm,
    };
}
