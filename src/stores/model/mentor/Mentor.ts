import { Model } from 'pinia-orm';
import Employee from '../employee/Employee';
import ProgrammaticArea from '../programmaticArea/ProgrammaticArea';
import TutorProgrammaticArea from 'stores/model/tutorProgrammaticArea/TutorProgrammaticArea';

export default class Mentor extends Model {
  static entity = 'mentores';
  static primaryKey = 'id';

  static fields() {
    return {
      id: this.attr(null),
      uuid: this.attr(''),
      employee_id: this.attr(''),
      perfil: this.attr(''),
      nivel_de_acesso: this.attr(''),
      // Relationships
      employee: this.belongsTo(Employee, 'employee_id'),
      tutorProgrammaticAreas: this.hasMany(TutorProgrammaticArea, 'mentor_id'),
      internalLocation: this.attr(null),
    };
  }

  static piniaOptions = {
    persist: true,
  };
}
