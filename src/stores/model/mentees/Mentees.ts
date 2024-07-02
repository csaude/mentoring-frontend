import { Model } from 'pinia-orm';
import Employee from '../employee/Employee';

export default class Mentees extends Model {
  static entity = 'mentorados';
  static primaryKey = 'id';

  static fields() {
    return {
      id: this.attr(null),
      uuid: this.attr(''),
      employee_id: this.attr(''),
      zeroEvaluationDone: this.attr(false),
      // relationships
      employee: this.belongsTo(Employee, 'employee_id'),
    };
  }

  static piniaOptions = {
    persist: true,
  };
}
