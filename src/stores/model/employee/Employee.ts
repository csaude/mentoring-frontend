import { Model } from 'pinia-orm';
import ProfessionalCategory from '../professionalCategory/ProfessionalCategory';
import Partner from '../partner/Partner';
import Location from '../location/Location';

export default class Employee extends Model {
  static entity = 'employees';
  static primaryKey = 'id';
  static fields() {
    return {
      id: this.attr(null),
      uuid: this.attr(''),
      name: this.attr(''),
      surname: this.attr(''),
      nuit: this.attr(''),
      trainingYear: this.attr(''),
      phoneNumber: this.attr(''),
      email: this.attr(''),
      category_id: this.attr(''),
      partner_id: this.attr(''),
      
      // Relationships
      professionalCategory: this.belongsTo(ProfessionalCategory, 'category_id'),
      partner: this.belongsTo(Partner, 'partner_id'),
      locations: this.hasMany(Location, 'employee_id'),

    };
  }
  static piniaOptions = {
    persist: true,
  };
}