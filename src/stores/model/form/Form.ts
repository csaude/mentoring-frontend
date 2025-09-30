import { Model } from 'pinia-orm';
import ProgrammaticArea from '../programmaticArea/ProgrammaticArea';
import Partner from '../partner/Partner';
import FormSection from './FormSection';
import EvaluatioLocation from '../question/EvaluationLocation';

export default class Form extends Model {
  static entity = 'forms';
  static primaryKey = 'id';

  static fields() {
    return {
      id: this.attr(null),
      uuid: this.attr(''),
      code: this.attr(''),
      description: this.attr(''),
      name: this.attr(''),
      targetPatient: this.attr(''),
      targetFile: this.attr(''),
      lifeCycleStatus: this.attr(''),
      evaluation_location_id: this.attr(''),
      createdBy: this.attr(null),
      createdAt: this.attr(null),
      programmatic_area_id: this.attr(''),
      partner_id: this.attr(''),
    
      // Relationships
      programmaticArea: this.belongsTo(ProgrammaticArea, 'programmatic_area_id'),
      partner: this.belongsTo(Partner, 'partner_id'),
      evaluationLocation: this.belongsTo(EvaluatioLocation, 'evaluation_location_id'),
      formSections: this.hasMany(FormSection, 'form_id'),

    };
  }

  static piniaOptions = {
    persist: true,
  };
}