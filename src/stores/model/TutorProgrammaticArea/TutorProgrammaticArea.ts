import { Model } from 'pinia-orm';
import ProgrammaticArea from '../programmaticArea/ProgrammaticArea';
import Mentor from '../mentor/Mentor';

export default class TutorProgrammaticArea extends Model {
  static entity = 'tutorProgrammaticAreas';
  static primaryKey = 'id';
  static fields() {
    return {
      id: this.number(() => 0),
      uuid: this.attr(''),
      salt: this.attr(''),
      tutor_id: this.attr(''),
      programmaticArea_id: this.attr(''),
      // relationships
      tutor: this.belongsTo(Mentor, 'tutor_id'),
      programmaticArea: this.belongsTo(ProgrammaticArea, 'programmaticArea_id'),
    };
  }
  static piniaOptions = {
    persist: true,
  };
}
