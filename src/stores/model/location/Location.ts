import { Model } from 'pinia-orm';
import Province from './Province';
import District from './District';
import Employee from '../employee/Employee';
import HealthFacility from '../healthfacility/HealthFacility';

export default class Location extends Model {
  static entity = 'locations';
  static primaryKey = 'id';

  static fields() {
    return {
      id: this.attr(null),
      uuid: this.attr(''),
      locationLevel: this.attr(''),
      district_id: this.attr(''),
      province_id: this.attr(''),
      employee_id: this.attr(''),
      healthFacility_id: this.attr(''),
      province: this.belongsTo(Province, 'province_id'),
      district: this.belongsTo(District, 'district_id'),
      employee: this.belongsTo(Employee, 'employee_id'),
      healthFacility: this.belongsTo(HealthFacility, 'healthFacility_id'),

      // UI ONLY
      isInternal: this.attr(false),
    };
  }

  static piniaOptions = {
    persist: true,
  };
}
