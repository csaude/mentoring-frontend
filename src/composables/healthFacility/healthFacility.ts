import HealthFacility from "src/stores/model/healthfacility/HealthFacility";
import useDistrict from "../district/districtMethods";

export default function useHealthFacility() {

    function createHealthFacilityFromDTO(healthFacilityDTO: any) {
        const { createDistrictFromDTO } = useDistrict();
        return  new HealthFacility({
            id: healthFacilityDTO.id,
            uuid: healthFacilityDTO.uuid,
            healthFacility: healthFacilityDTO.healthFacility,
            district: healthFacilityDTO.districtDTO ? createDistrictFromDTO(healthFacilityDTO.districtDTO) : null,
          })
    }

    function createDTOFromHealthFacility(healthFacility: HealthFacility) {
        const { createDTOFromDistrict } = useDistrict();
        const healthFacilityDTO = {
            id: healthFacility.id,
            uuid: healthFacility.uuid,
            healthFacility: healthFacility.healthFacility,
            districtDTO: createDTOFromDistrict(healthFacility.district)
          }
        return  healthFacilityDTO
    }

    return {
        createHealthFacilityFromDTO,
        createDTOFromHealthFacility
    }
}
