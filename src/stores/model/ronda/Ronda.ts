import { Model } from 'pinia-orm';
import HealthFacility from '../healthfacility/HealthFacility';
import RondaType from './RondaType';
import RondaMentee from './RondaMentee';
import RondaMentor from './RondaMentor';

export default class Ronda extends Model {
  static entity = 'rondas';
  static primaryKey = 'id';
  static fields() {
    return {
      id: this.attr(null),
      uuid: this.attr(''),
      description: this.attr(''),
      startDate: this.attr(''),
      createdAt: this.attr(''),
      endDate: this.attr(''),
      ronda_type_id: this.attr(''),
      health_facility_id: this.attr(''),
      lifeCycleStatus: this.attr(''),
      // relationships
      rondaType: this.belongsTo(RondaType, 'ronda_type_id'),
      healthFacility: this.belongsTo(HealthFacility, 'health_facility_id'),
      rondaMentees: this.hasMany(RondaMentee, 'ronda_id'),
      rondaMentors: this.hasMany(RondaMentor, 'ronda_id'),
    };
  }
  static piniaOptions = {
    persist: true,
  };
}
