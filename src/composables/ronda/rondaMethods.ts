import useDistrict from "src/composables/district/districtMethods";
import HealthFacility from "stores/model/healthfacility/HealthFacility";
import useHealthFacility from "src/composables/healthFacility/healthFacility";
import Ronda from "stores/model/ronda/Ronda";
import RondaType from "stores/model/ronda/RondaType";
import RondaMentee from "stores/model/ronda/RondaMentee";
import Mentees from "stores/model/mentees/Mentees";
import useEmployee from "src/composables/employee/employeeMethods";
import employeeService from "src/services/api/employee/employeeService";
import rondaService from "src/services/api/ronda/rondaService";
import RondaMentor from "stores/model/ronda/RondaMentor";
import Mentor from "stores/model/mentor/Mentor";
import Employee from "stores/model/employee/Employee";
import ProfessionalCategory from "stores/model/professionalCategory/ProfessionalCategory";
import Partner from "stores/model/partner/Partner";
import Location from "stores/model/location/Location";
import useMentor from "src/composables/mentor/mentorMethods";

export default function useRonda() {
    function createRondaFromDTO(rondaDTO: any) {
        return new Ronda({
            id: rondaDTO.id,
            uuid: rondaDTO.uuid,
            description: rondaDTO.description,
            startDate: rondaDTO.startDate,
            endDate: rondaDTO.endDate,
            createdAt: rondaDTO.createdAt,
            ronda_type_id: rondaDTO.rondaTypeDTO.id,
            health_facility_id: rondaDTO.healthFacility.id,
            lifeCycleStatus: rondaDTO.lifeCycleStatus,
            healthFacility: useHealthFacility().createHealthFacilityFromDTO(rondaDTO.healthFacility),
            rondaType: createRondaTypeFromDTO(rondaDTO.rondaTypeDTO),
            // rondaMentees: doCreateRondaMenteeFromDTO(rondaDTO),
            rondaMentors: doCreateRondaMentorsFromDTO(rondaDTO)
        });
    }
    function doCreateRondaMenteeFromDTO (ronda: any){
        const rondaMenteesDTO: RondaMentee[] = []
        ronda.rondaMentees.forEach((rondaMentee: any) => {
            const rm = createRondaMenteeFromDTO(rondaMentee.rondaMentee, ronda)
            rondaMenteesDTO.push(rm)
        })
        return rondaMenteesDTO
    }
    function doCreateRondaMentorsFromDTO (ronda: any){
        const rondaMentorsDTO: RondaMentor[] = []
        ronda.rondaMentors.forEach((rondaMentor: any) => {
            const rm = createRondaMentorFromDTO(rondaMentor, ronda)
            rondaMentorsDTO.push(rm)
        })
        return rondaMentorsDTO
    }
    function createDTOFromRonda(ronda: Ronda) {
        const rondaDTO = {
            id: ronda.id,
            uuid: ronda.uuid,
            description: ronda.description,
            startDate: ronda.startDate,
            endDate: ronda.endDate,
            healthFacility: {
                id: ronda.healthFacility.id,
                uuid: ronda.healthFacility.uuid,
                healthFacility: ronda.healthFacility.healthFacility,
                district: useDistrict().createDTOFromDistrict(ronda.healthFacility.district),
            },
            rondaType: {
                id: ronda.rondaType.id,
                uuid: ronda.rondaType.uuid,
                code: ronda.rondaType.code,
                description: ronda.rondaType.description
            },
            rondaMentees: ronda.rondaMentees.map((mentee: RondaMentee) => ({
                uuid: mentee.uuid,
                startDate: mentee.startDate,
                createdAt: mentee.createdAt,
                tutored: {
                    id: mentee.tutored.id,
                    uuid: mentee.tutored.uuid,
                    zeroEvaluationDone: mentee.tutored.zeroEvaluationDone,
                    employee_id: mentee.tutored.employee_id,
                    employee: employeeService.getById(mentee.tutored.employee_id)
                }
            })),
            rondaMentors: ronda.rondaMentors.map((mentor: RondaMentor) => ({
                id: mentor.id,
                uuid: mentor.uuid,
                startDate: mentor.startDate,
                createdAt: mentor.createdAt,
                mentor: {
                    id: mentor.mentor.id,
                    uuid: mentor.mentor.uuid,
                    perfil: mentor.mentor.perfil,
                    employee_id: mentor.mentor.employee_id,
                    employee: employeeService.getById(mentor.mentor.employee_id)
                }
            }))
        };
        return rondaDTO;
    }


    function createRondaMenteeFromDTO(rondaMenteeDTO: any, ronda: any){
        return new RondaMentee({
            uuid: rondaMenteeDTO.uuid,
            startDate: rondaMenteeDTO.startDate,
            createdAt: rondaMenteeDTO.createdAt,
            // relationships
            tutored: new Mentees({
                id: rondaMenteeDTO.tutored.id,
                uuid: rondaMenteeDTO.tutored.uuid,
                zeroEvaluationDone: rondaMenteeDTO.tutored.zeroEvaluationDone,
                employee_id: rondaMenteeDTO.tutored.employee.id,
                employee: employeeService.getById(rondaMenteeDTO.tutored.employee.id)
            }),
            ronda_id: ronda.ronda.id,
            tutored_id: rondaMenteeDTO.tutored.id
        })
    }

    function createRondaMentorFromDTO(rondaMentorDTO: any, ronda: any) {
        rondaMentorDTO.rondaMentor.mentor.tutorProgrammaticAreas = [];
        rondaMentorDTO.rondaMentor.mentor.employeeDTO = rondaMentorDTO.rondaMentor.mentor.employee;
        rondaMentorDTO.rondaMentor.mentor.employeeDTO.partnerDTO = rondaMentorDTO.rondaMentor.mentor.employee.partner;
        rondaMentorDTO.rondaMentor.mentor.employeeDTO.locationDTOSet = rondaMentorDTO.rondaMentor.mentor.employee.locations;
        rondaMentorDTO.rondaMentor.mentor.employeeDTO.professionalCategoryDTO = rondaMentorDTO.rondaMentor.mentor.employee.professionalCategory;
        const res = new RondaMentor({
            id: rondaMentorDTO.id,
            uuid: rondaMentorDTO.rondaMentor.uuid,
            startDate: rondaMentorDTO.rondaMentor.startDate,
            endDate: rondaMentorDTO.rondaMentor.endDate,
            createdAt: rondaMentorDTO.rondaMentor.createdAt,
            // relationships

            mentor: useMentor().createMentorFromDTO(rondaMentorDTO.rondaMentor.mentor),
            ronda_id: ronda.ronda.id,
        });
        return res;
    }


    function createDTOFromRondaType (rondaType: RondaType){
        return {
            id: rondaType.id,
            uuid: rondaType.uuid,
            code: rondaType.code,
            description: rondaType.description
        }
    }
    function createRondaTypeFromDTO (rondaTypeDTO: any){
        return new RondaType({
            id: rondaTypeDTO.id,
            uuid: rondaTypeDTO.uuid,
            code: rondaTypeDTO.code,
            description: rondaTypeDTO.description
        })
    }


    return {
        createRondaFromDTO,
        createDTOFromRonda,
        createDTOFromRondaType,
        createRondaTypeFromDTO
    }
}
