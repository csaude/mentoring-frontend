import FormSectionQuestion from 'stores/model/form/FormSectionQuestion';
import useQuestion from 'src/composables/question/questionMethods';
import useEvaluationType from 'src/composables/question/evaluationTypeMethods';
import useResponseType from 'src/composables/question/responseTypeMethods';
import useEvaluationLocation from 'src/composables/question/evaluationLocationMethods'
export default function useFormSectionQuestion() {
  const {createEvaluationLocationFromDTO, createDTOFromEvaluationLocation} = useEvaluationLocation();

    function createFormSectionQuestionFromDTO(formSectionQuestionDTO: any) {
      const { createQuestionFromDTO } = useQuestion();
      const { createEvaluationTypeFromDTO } = useEvaluationType();
      const { createResponseTypeFromDTO } = useResponseType();

      const formSectionQuestion = new FormSectionQuestion({
        id: formSectionQuestionDTO.id,
        uuid: formSectionQuestionDTO.uuid,
        mandatory: formSectionQuestionDTO.mandatory,
        sequence: formSectionQuestionDTO.sequence,
        applicable: formSectionQuestionDTO.applicable,
        createdAt: formSectionQuestionDTO.createdAt,
        createdBy: formSectionQuestionDTO.createdBy,
        question: createQuestionFromDTO(formSectionQuestionDTO.questionDTO),
        evaluationType: createEvaluationTypeFromDTO(formSectionQuestionDTO.evaluationType),
        responseType: createResponseTypeFromDTO(formSectionQuestionDTO.responseType),
        in_use: formSectionQuestionDTO.in_use,        
        evaluationLocation: createEvaluationLocationFromDTO(formSectionQuestionDTO.evaluationLocation)
        });
        return formSectionQuestion;
    }

    function createDTOFromFormSectionQuestion(formSectionQuestion: FormSectionQuestion) {

      const { createDTOFromQuestion } = useQuestion();
      const { createDTOFromEvaluationType } = useEvaluationType();
      const { createDTOFromResponseType } = useResponseType();
        const formQuestionDTO = {
            id: formSectionQuestion.id,
            uuid: formSectionQuestion.uuid,
            mandatory: formSectionQuestion.mandatory,
            sequence: formSectionQuestion.sequence,
            applicable: formSectionQuestion.applicable,
            createdAt: formSectionQuestion.createdAt,
            createdBy: formSectionQuestion.createdBy,
            questionDTO: createDTOFromQuestion(formSectionQuestion.question),
            evaluationType: createDTOFromEvaluationType(formSectionQuestion.evaluationType),
            responseType: createDTOFromResponseType(formSectionQuestion.responseType),
            evaluationLocation: createDTOFromEvaluationLocation(formSectionQuestion.evaluationLocation)
          }
        return  formQuestionDTO;
    }

    return {
        createFormSectionQuestionFromDTO: createFormSectionQuestionFromDTO,
        createDTOFromFormSectionQuestion: createDTOFromFormSectionQuestion,
      };
}
