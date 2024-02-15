import Location from 'src/stores/model/location/Location';
import useDistrict from '../district/districtMethods';
import useProvince from '../province/provinceMethods';
import useHealthFacility from '../healthFacility/healthFacility';

export default function useLocation() {
  function createLocationFromDTO(locationDTO: any) {
    const { createDistrictFromDTO } = useDistrict();
    const { createProvinceFromDTO } = useProvince();
    const { createHealthFacilityFromDTO } = useHealthFacility();

    return new Location({
      id: locationDTO.id,
      uuid: locationDTO.uuid,
      locationLevel: locationDTO.locationLevel,
      district:
        locationDTO.districtDTO !== undefined
          ? createDistrictFromDTO(locationDTO.districtDTO)
          : '',
      healthFacility:
        locationDTO.healthFacilityDTO !== undefined
          ? createHealthFacilityFromDTO(locationDTO.healthFacilityDTO)
          : '',
      province:
        locationDTO.provinceDTO !== undefined
          ? createProvinceFromDTO(locationDTO.provinceDTO)
          : '',
    });
  }

  function createDTOFromLocation(location: Location) {
    const { createDTOFromDistrict } = useDistrict();
    const { createDTOFromProvince } = useProvince();
    const { createDTOFromHealthFacility } = useHealthFacility();

    const locationDTO = {
      id: location.id,
      uuid: location.uuid,
      locationLevel: location.locationLevel,
      districtDTO:
        location.district !== undefined
          ? createDTOFromDistrict(location.district)
          : '',
      healthFacilityDTO:
        location.healthFacility !== undefined
          ? createDTOFromHealthFacility(location.healthFacility)
          : '',
      provinceDTO:
        location.province !== undefined
          ? createDTOFromProvince(location.province)
          : '',
    };
    return locationDTO;
  }

  return {
    createLocationFromDTO,
    createDTOFromLocation,
  };
}
