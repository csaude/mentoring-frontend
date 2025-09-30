import EvaluationLocation from "src/stores/model/question/EvaluationLocation";

export default function useEvaluationLocation() {

    function createEvaluationLocationFromDTO(evaluationLocationDTO: any) {
      return  new EvaluationLocation({
          id: evaluationLocationDTO?.id,
          uuid: evaluationLocationDTO?.uuid,
          code: evaluationLocationDTO?.code,
          description: evaluationLocationDTO?.description,
        })
    }

    function createDTOFromEvaluationLocation(evaluationLocation: EvaluationLocation) {
        const evaluationLocationDTO = {
            id: evaluationLocation.id,
            uuid: evaluationLocation.uuid,
            code: evaluationLocation.code,
            description: evaluationLocation.description,
          }
        return  evaluationLocationDTO;
    }

    return {
        createEvaluationLocationFromDTO,
        createDTOFromEvaluationLocation,
      };
}