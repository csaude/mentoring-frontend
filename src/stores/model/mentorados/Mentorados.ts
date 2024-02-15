import { Model } from 'pinia-orm';
import Employee from '../employee/Employee';

export default class Mentorados extends Model {
  static entity = 'mentorados';
  static primaryKey = 'id';

  static fields() {
    return {
      id: this.attr(null),
      uuid: this.attr(''),
      employee_id: this.attr(''),
      // relationships
      employee: this.belongsTo(Employee, 'employee_id'),
    };
  }

  static piniaOptions = {
    persist: true,
  };
}
